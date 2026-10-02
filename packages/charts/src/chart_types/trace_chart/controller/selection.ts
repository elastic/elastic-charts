/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { collapseSetsEqual } from './constants';
import { getPipeline } from './pipeline';
import type { TraceCanvasController } from './trace_canvas_controller';
import type { DisclosureEntry, TraceProps } from './types';
import {
  buildDisclosureMap,
  buildTreeGuideMap,
  collapseLanes,
  collapsibleParentIds,
  rollupCriticalIntervals,
} from '../data/collapse';
import { waitingSegments } from '../data/self_time';
import type { NormalizedSpan } from '../data/types';
import { pickDisclosure } from '../render/canvas2d_renderer';
import { buildViewKey, hasViewKeyChanged } from '../render/interaction';
import { buildTraceSelectionDetail } from '../render/tooltip';
import type { TreeGuideEntry } from '../render/types';
import type { HoverRegion, PickResult } from '../render/types';
import type { selectionModeFromEvent } from '../selection_helpers';
import { applySelection, selectionSetEqual } from '../selection_helpers';
import type { TraceSegmentRef, TraceSelection } from '../trace_api';
import type { HoverState } from '../trace_state';

// -------------------------------------------------------------------------
// Selection helpers (ADR 0011)
// -------------------------------------------------------------------------

/**
 * Returns the controlled prop when present (perform-and-fire model), else the local field.
 * @internal
 */
export function getEffectiveSelection(c: TraceCanvasController): TraceSelection {
  return c.deps.getProps().traceSpec?.selection ?? c.selection;
}

/**
 * Fires `onSelectionChange` with the new selection and its rich details, guarded by the
 * order-insensitive set-equality echo guard (plan D1 / ADR 0011 Decision 2). Updates
 * `lastFiredSelection` **before** invoking the callback so a re-entrant controlled-prop update
 * is recognized as an echo and does not trigger a redundant redraw.
 * @internal
 */
export function fireSelectionChange(c: TraceCanvasController, next: TraceSelection) {
  if (selectionSetEqual(next, c.lastFiredSelection)) return;
  c.lastFiredSelection = next;
  const spec = c.deps.getProps().traceSpec;
  if (!spec?.onSelectionChange) return;
  const { spans, domain } = getPipeline(c, spec);
  const details = next
    .map((ref) => {
      const laneIndex = c.spanIdToLane.get(ref.spanId);
      if (laneIndex === undefined) return null;
      const span = spans[laneIndex];
      if (!span) return null;
      return buildTraceSelectionDetail(span, domain.min, ref.region, ref.segmentIndex);
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);
  spec.onSelectionChange(next, details);
}

/**
 * Writes the local (uncontrolled) selection field. In **controlled** mode (`spec.selection` set)
 * the parent owns the value, so this is a no-op — writing it would let the local field drift out of
 * sync with the prop and shadow it on the next uncontrolled read. Mirrors the prune path guard.
 * @internal
 */
export function setLocalSelection(c: TraceCanvasController, next: TraceSelection) {
  if (c.deps.getProps().traceSpec?.selection === undefined) c.selection = next;
}

// -------------------------------------------------------------------------
// Collapse helpers (Spec 21 / ADR 0026)
// -------------------------------------------------------------------------

/**
 * Returns a stable `Set<string>` for the effective collapsed ids. In controlled mode, caches the
 * conversion of the prop array to a Set (same array reference → same Set → memoization cache hit).
 * @internal
 */
export function getEffectiveCollapsed(c: TraceCanvasController): ReadonlySet<string> {
  const ids = c.deps.getProps().traceSpec?.collapsedSpanIds;
  if (ids === undefined) return c.collapsed;
  if (c.collapsedFromProp && c.collapsedFromProp.ids === ids) return c.collapsedFromProp.asSet;
  const asSet = new Set<string>(ids);
  c.collapsedFromProp = { ids, asSet };
  return asSet;
}

/**
 * Fires `onCollapseChange` with the new id array, guarded by set-equality echo suppression.
 * @internal
 */
export function fireCollapseChange(c: TraceCanvasController, next: Set<string>) {
  if (collapseSetsEqual(next, c.lastFiredCollapsed)) return;
  c.lastFiredCollapsed = new Set(next); // capture before calling out
  c.deps.getProps().traceSpec?.onCollapseChange?.([...next]);
}

/**
 * Writes the local (uncontrolled) collapsed field and invalidates the collapse cache. In
 * **controlled** mode (`spec.collapsedSpanIds` set) the parent owns the value, so this is a no-op —
 * `syncCollapseLifecycle` re-syncs the cache when the prop echoes back. Mirrors {@link setLocalSelection}.
 * @internal
 */
export function setLocalCollapsed(c: TraceCanvasController, next: Set<string>) {
  const props = c.deps.getProps();
  if (props.traceSpec?.collapsedSpanIds === undefined) {
    c.collapsed = next;
    c.collapseCache = null;
    // Publish the uncontrolled collapse into redux so the screen-reader table matches the canvas
    // (ADR 0012). In controlled mode the `collapsedSpanIds` prop is already selector-visible.
    props.setTraceUncontrolledCollapsed([...next]);
  }
}

/** Shared empty guide map for the `withTreeGuides=false` fast path (no allocation per frame). */
const EMPTY_TREE_GUIDES = new Map<number, TreeGuideEntry>();

/**
 * Returns the `collapseLanes` result, the `disclosureByLane` map, and (when `withTreeGuides` is
 * true) the per-lane tree-guide mask for the given pipeline spans + collapsed set, reusing the
 * cached output when no input has changed (by reference). Runs at most once per toggle or pipeline
 * change, never per rAF frame.
 * @internal
 */
export function getCollapseOutput(
  c: TraceCanvasController,
  pipelineSpans: NormalizedSpan[],
  collapsed: ReadonlySet<string>,
  depthBySpan: ReadonlyMap<NormalizedSpan, number>,
  criticalIntervals: Array<{ spanId: string; start: number; end: number }>,
  withTreeGuides: boolean,
): {
  spans: NormalizedSpan[];
  disclosure: Map<number, DisclosureEntry>;
  rolledUpCriticalIntervals: Array<{ spanId: string; start: number; end: number }>;
  treeGuides: Map<number, TreeGuideEntry>;
} {
  if (
    c.collapseCache &&
    c.collapseCache.pipelineSpans === pipelineSpans &&
    c.collapseCache.collapsed === collapsed &&
    c.collapseCache.criticalIntervals === criticalIntervals &&
    c.collapseCache.withTreeGuides === withTreeGuides
  ) {
    return {
      spans: c.collapseCache.result,
      disclosure: c.collapseCache.disclosure,
      rolledUpCriticalIntervals: c.collapseCache.rolledUpCriticalIntervals,
      treeGuides: c.collapseCache.treeGuides,
    };
  }
  const result = collapseLanes(pipelineSpans, collapsed);
  // parentIds computed here (on cache miss only) to avoid O(N) work every rAF frame.
  // Gate on depthBySpan.size > 0: orderLanes returns an empty Map in chronological mode, so
  // parentIds must also be empty there — otherwise disclosureByLane is populated and carets
  // render even though collapse is disabled in that mode.
  const parentIds = depthBySpan.size > 0 ? collapsibleParentIds(pipelineSpans) : new Set<string>();
  const disclosure = buildDisclosureMap(pipelineSpans, result, collapsed, depthBySpan, parentIds);
  // Roll up critical intervals onto their outermost visible collapsed ancestor (ADR 0015 Decision 4).
  const rolledUpCriticalIntervals = rollupCriticalIntervals(pipelineSpans, collapsed, criticalIntervals);
  // Tree guides: build the guide mask only when the prop is on, sharing a single empty map otherwise
  // so the prop-off path allocates nothing. The guide map has the same lifecycle as disclosure —
  // collapse toggles invalidate both — so it lives in the same cache entry (ADR 0037 D1 precedent).
  const treeGuides = withTreeGuides ? buildTreeGuideMap(pipelineSpans, result, depthBySpan) : EMPTY_TREE_GUIDES;
  c.collapseCache = {
    pipelineSpans,
    collapsed,
    criticalIntervals,
    withTreeGuides,
    result,
    rolledUpCriticalIntervals,
    disclosure,
    treeGuides,
  };
  return { spans: result, disclosure, rolledUpCriticalIntervals, treeGuides };
}

// -------------------------------------------------------------------------
// Lifecycle sync (data/view changes)
// -------------------------------------------------------------------------

/**
 * Selection lifecycle on data/view changes (ADR 0011 Decision 4 / plan D3).
 * @internal
 */
export function syncSelectionLifecycle(c: TraceCanvasController, prevProps: TraceProps) {
  const spec = c.deps.getProps().traceSpec;
  if (!spec) return;

  const viewKeyChanged = hasViewKeyChanged(
    c.viewKey && prevProps.traceSpec ? buildViewKey(prevProps.traceSpec) : null,
    buildViewKey(spec),
  );
  if (viewKeyChanged) {
    // View-domain semantics changed — stale selection (ADR 0011 mirrors pin reset).
    // Fire onSelectionChange([]) only if selection was non-empty.
    const current = getEffectiveSelection(c);
    if (current.length > 0) {
      setLocalSelection(c, []);
      fireSelectionChange(c, []);
      c.scheduleRender?.();
    }
  } else if (spec.data !== prevProps.traceSpec?.data) {
    // Data changed: prune stale refs (authoritative — plan D3).
    const current = getEffectiveSelection(c);
    if (current.length > 0) {
      const { spans } = getPipeline(c, spec);
      const pruned = current.filter((ref) => {
        const laneIndex = c.spanIdToLane.get(ref.spanId);
        if (laneIndex === undefined) return false;
        const s = spans[laneIndex];
        if (!s) return false;
        if (ref.region === 'span') return true;
        // Segment refs must carry a concrete in-range index; a missing one is a stale/invalid ref.
        if (ref.segmentIndex === undefined) return false;
        if (ref.region === 'active' && ref.segmentIndex >= s.activeSegments.length) return false;
        // waitingSegments is cheap (inline gap loop) so computing it once to validate is fine.
        if (ref.region === 'waiting' && ref.segmentIndex >= waitingSegments(s).length) return false;
        return true;
      });
      if (pruned.length !== current.length) {
        // In controlled mode: fire only, don't write the field (parent owns the prop).
        setLocalSelection(c, pruned);
        fireSelectionChange(c, pruned);
        c.scheduleRender?.();
      }
    }
  }

  // Echo-guard: if controlled selection prop changed and is set-equal to lastFired, no-op.
  if (
    spec.selection !== undefined &&
    spec.selection !== prevProps.traceSpec?.selection &&
    !selectionSetEqual(spec.selection, c.lastFiredSelection)
  ) {
    c.lastFiredSelection = spec.selection;
    c.scheduleRender?.();
  }
}

/**
 * Prunes stale collapsed ids (span gone or no longer a parent) from the uncontrolled state.
 * @internal
 */
export function syncCollapseLifecycle(c: TraceCanvasController, prevProps: TraceProps) {
  const spec = c.deps.getProps().traceSpec;
  if (!spec) return;

  if (spec.data !== prevProps.traceSpec?.data && c.collapsed.size > 0) {
    const { spans } = getPipeline(c, spec);
    const parents = collapsibleParentIds(spans);
    const pruned = new Set([...c.collapsed].filter((id) => parents.has(id)));
    if (pruned.size !== c.collapsed.size) {
      setLocalCollapsed(c, pruned);
      fireCollapseChange(c, pruned);
      c.scheduleRender?.();
    }
  }

  // Echo-guard: controlled prop changed → update cache reference so memoization stays valid, and
  // sync lastFiredCollapsed so a parent-driven change is recognized as an echo and does not fire a
  // redundant onCollapseChange on the next toggle (mirrors the selection echo-sync above).
  if (spec.collapsedSpanIds !== undefined && spec.collapsedSpanIds !== prevProps.traceSpec?.collapsedSpanIds) {
    const asSet = new Set(spec.collapsedSpanIds);
    if (!collapseSetsEqual(asSet, c.lastFiredCollapsed)) {
      c.lastFiredCollapsed = asSet;
    }
    c.collapsedFromProp = null; // force re-cache on next getEffectiveCollapsed() call
    c.collapseCache = null;
    c.scheduleRender?.();
  }
}

// -------------------------------------------------------------------------
// Selection commit (used by both mouse and touch handlers)
// -------------------------------------------------------------------------

/**
 * Converts an internal {@link PickResult} region+segmentIndex (which uses `-1` for "no segment")
 * into a public {@link TraceSegmentRef}. Span/empty regions become a span-level ref with no
 * `segmentIndex`; active/waiting regions carry the concrete index (dropping the `-1` sentinel so it
 * never leaks into the public selection model).
 * @internal
 */
export function buildSegmentRef(spanId: string, region: HoverRegion, segmentIndex: number): TraceSegmentRef {
  if ((region === 'active' || region === 'waiting') && segmentIndex >= 0) {
    return { spanId, region, segmentIndex };
  }
  return { spanId, region: 'span' };
}

/** @internal */
export function commitSegmentSelection(
  c: TraceCanvasController,
  result: PickResult | null,
  geom: NonNullable<HoverState['lastGeom']>,
  mode: ReturnType<typeof selectionModeFromEvent>,
) {
  const isHit = result && result.index >= 0 && result.region !== 'empty';
  const current = getEffectiveSelection(c);
  let next: TraceSelection;
  if (!isHit || !result) {
    next = mode === 'replace' ? [] : current;
  } else {
    const span = geom.spans[result.index];
    if (!span) {
      next = mode === 'replace' ? [] : current;
    } else {
      next = applySelection(current, buildSegmentRef(span.id, result.region, result.segmentIndex), mode);
    }
  }
  setLocalSelection(c, next);
  fireSelectionChange(c, next);
  c.scheduleRender?.();
}

/** @internal */
export function commitSpanSelection(
  c: TraceCanvasController,
  result: PickResult,
  geom: NonNullable<HoverState['lastGeom']>,
  mode: ReturnType<typeof selectionModeFromEvent>,
) {
  if (result.index < 0) return;
  const span = geom.spans[result.index];
  if (!span) return;

  const ref: TraceSegmentRef = { spanId: span.id, region: 'span' };
  const current = getEffectiveSelection(c);
  const next = applySelection(current, ref, mode);

  if (process.env.NODE_ENV !== 'production') {
    const hasSegmentRefForSameSpan = next.some((r) => r.spanId === span.id && r.region !== 'span');
    if (hasSegmentRefForSameSpan) {
      // eslint-disable-next-line no-console
      console.warn(
        `[elastic-charts/trace] Selection contains both a span ref and a segment ref for spanId="${span.id}". ` +
          `The segment outline will be suppressed (deduped) in the highlight pass.`,
      );
    }
  }

  setLocalSelection(c, next);
  fireSelectionChange(c, next);
  c.scheduleRender?.();
}

/**
 * Toggles collapse for the lane under a disclosure caret at (x, y). Returns true if a caret was hit.
 * @internal
 */
export function toggleDisclosureAt(c: TraceCanvasController, x: number, y: number): boolean {
  if (!c.hover.lastGeom) return false;
  const caretLane = pickDisclosure(x, y, c.hover.lastGeom);
  if (caretLane < 0) return false;
  const caretSpan = c.hover.lastGeom.spans[caretLane];
  if (!caretSpan) return false;
  // Read the effective (controlled prop or local) collapsed set, not the local field, so a
  // controlled toggle computes the next set from the source of truth (plan controlled-state-fixes).
  const next = new Set(getEffectiveCollapsed(c));
  const willCollapse = !next.has(caretSpan.id);
  if (willCollapse) next.add(caretSpan.id);
  else next.delete(caretSpan.id);
  setLocalCollapsed(c, next);
  fireCollapseChange(c, next);
  const ariaLive = c.deps.getAriaLive();
  if (ariaLive) {
    const descCount = c.hover.lastGeom.disclosureByLane.get(caretLane)?.descendantCount ?? 0;
    ariaLive.textContent = willCollapse
      ? `Collapsed ${caretSpan.name}, ${descCount} descendants hidden`
      : `Expanded ${caretSpan.name}`;
  }
  c.scheduleRender?.();
  return true;
}
