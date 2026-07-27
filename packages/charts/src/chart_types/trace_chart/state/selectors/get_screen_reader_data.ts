/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTraceAnnotationSpecsSelector } from './get_annotation_specs';
import { ChartType } from '../../..';
import type { ElementClickListener, TraceBadgeElementEvent } from '../../../../specs/settings';
import { SpecType } from '../../../../specs/spec_type';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { EMPTY_SCREEN_READER_ITEMS, type ScreenReaderItem } from '../../../../state/selectors/get_screenreader_data';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSpecsFromStore } from '../../../../state/utils/get_specs_from_store';
import type { ResolvedTraceAnnotation } from '../../data/annotations';
import { resolveTraceAnnotations } from '../../data/annotations';
import { resolveSpanBadges } from '../../data/badges';
import { buildDisclosureMap, collapseLanes, collapsibleParentIds } from '../../data/collapse';
import { normalize } from '../../data/normalize';
import { orderLanes } from '../../data/order_lanes';
import { resolveActive } from '../../data/self_time';
import type { NormalizedSpan } from '../../data/types';
import { resolveBadgeAriaLabel } from '../../render/badge_layout';
import { buildTraceBadgeEvent, computeSelfTime, formatMs } from '../../render/tooltip';
import type { TraceSpec } from '../../trace_api';
import { resolveTraceColorBy } from '../../trace_api';

/**
 * One Span badge as exposed to assistive technology in the screen-reader table (Spec 27). Carries the
 * resolved accessible name plus the pre-built {@link TraceBadgeElementEvent} dispatched (through
 * `Settings.onElementClick`) on keyboard activation. Coordinates are omitted since keyboard
 * activation has no pointer position. Includes badges omitted from the visual layout for overflow —
 * assistive tech always sees the full set.
 * @internal
 */
export interface TraceTableBadge {
  id: string;
  ariaLabel: string;
  /** The keyboard-activation event, dispatched as-is through `Settings.onElementClick`. */
  event: TraceBadgeElementEvent;
}

/**
 * One row of the screen-reader trace table.
 * @internal
 */
export interface TraceTableRow {
  id: string;
  name: string;
  totalDuration: string;
  selfTime: string;
  startOffset: string;
  parentName: string;
  /** The span's Span badges in accessor order (empty when the span has none). */
  badges: TraceTableBadge[];
}

/**
 * Screen-reader parent description for one span. For a partial-trace orphan (Spec 26) it discloses
 * the missing recorded parent and its synthetic display placement instead of a resolved parent name;
 * otherwise it resolves the recorded parent's name (or `—` when absent/unset).
 * @internal
 */
export function describeParent(span: NormalizedSpan, nameById: Map<string, string>): string {
  if (span.orphaned) {
    return span.reparentedToSpanId !== undefined
      ? `orphan; displayed under ${nameById.get(span.reparentedToSpanId) ?? span.reparentedToSpanId}`
      : 'orphan; used as display root';
  }
  return span.parentId !== undefined ? nameById.get(span.parentId) ?? '—' : '—';
}

/**
 * Derives `NormalizedSpan[]` from the `TraceSpec` via the existing `normalize`/`resolveActive`
 * pipeline. This is a second memoized call site (the component owns the first); same inputs →
 * identical output per ADR 0004 (canvas/DOM seam). Keyed on `(spec.data, spec.xScaleType,
 * spec.traceId, spec.colorBy, spec.laneOrder, vizColors)` matching the component's `pipelineCache`
 * keys — `laneOrder` is included so the SR table's lane indices stay identical to the visual order
 * (Spec 12/13 depend on this consistency).
 *
 * Returns `null` when no spec is present.
 * @internal
 */
const getNormalizedSpans = createCustomCachedSelector(
  [
    (state: GlobalChartState) => getSpecsFromStore<TraceSpec>(state.specs, ChartType.Trace, SpecType.Series)[0],
    (state: GlobalChartState) => getChartThemeSelector(state).colors.vizColors,
    (state: GlobalChartState) => state.interactions.traceCollapsedSpanIds,
  ],
  (
    spec,
    vizColors,
    uncontrolledCollapsedSpanIds,
  ): {
    spans: NormalizedSpan[];
    /** Pre-collapse ordered lanes — the prepared data annotation resolution validates against (Spec 29). */
    orderedSpans: NormalizedSpan[];
    disclosure: Map<number, { state: 'collapsed' | 'expanded'; depth: number; descendantCount: number }>;
    domain: { min: number; max: number };
    /** Re-zero offset for caller-supplied annotation `time`/`range` (Spec 29). */
    projectionOffset: number;
  } | null => {
    if (!spec || spec.data.length === 0) return null;
    const result = normalize(spec.data, spec.xScaleType, spec.traceId, resolveTraceColorBy(spec.colorBy), vizColors);
    // Second badge call site (ADR 0004): resolve the same Span badges as the visual pipeline so the
    // screen-reader table exposes identical badges. Diagnostics are not surfaced yet (Spec 28 phase).
    const withBadges = resolveSpanBadges(result.spans, spec.badgeAccessor);
    const { lanes: orderedSpans, depthBySpan } = orderLanes(resolveActive(withBadges), spec.laneOrder ?? 'tree');
    // Apply collapse. Controlled mode: the `collapsedSpanIds` prop is authoritative. Uncontrolled
    // mode: the component publishes its local collapse into redux (`setTraceUncontrolledCollapsed`)
    // so this SR table matches the visual collapse (ADR 0013 canvas/store seam).
    const effectiveCollapsed = new Set(spec.collapsedSpanIds ?? uncontrolledCollapsedSpanIds);
    const spans = collapseLanes(orderedSpans, effectiveCollapsed);
    const parentIds = collapsibleParentIds(orderedSpans);
    const disclosure = buildDisclosureMap(orderedSpans, spans, effectiveCollapsed, depthBySpan, parentIds);
    return { spans, orderedSpans, disclosure, domain: result.domain, projectionOffset: result.projectionOffset };
  },
);

/**
 * Summary items for `ScreenReaderSummary`: "Trace chart" type + span count.
 * Wired into `chart_selectors.ts` to override the default "Chart type" summary.
 * @internal
 */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getNormalizedSpans, getA11ySettingsSelector],
  (pipeline, a11ySettings): ScreenReaderItem[] => {
    if (!pipeline) return EMPTY_SCREEN_READER_ITEMS;
    return [
      { label: 'Chart type', id: a11ySettings.defaultSummaryId, value: 'Trace chart' },
      // After collapse, spans.length is the visible count (mirroring the canvas lane count).
      { label: 'Spans', value: String(pipeline.spans.length) },
    ];
  },
);

/**
 * The library-wide `Settings.onElementClick` handler, or `undefined` when none is supplied. In the
 * unified event model this is the single channel for badge and annotation activation, so it drives
 * whether the screen-reader surfaces render Span badges (Spec 27) and annotations (Spec 29) as
 * keyboard-activatable `<button>` controls (handler present) or inert informational text.
 * @internal
 */
export const getTraceElementClickHandlerSelector = createCustomCachedSelector(
  [getSettingsSpecSelector],
  (settings): ElementClickListener | undefined => settings.onElementClick,
);

/**
 * Resolves composed Trace annotations (Spec 29) for the screen-reader surface. This is the SR-side
 * mirror of the visual `getResolvedAnnotations` memo (ADR 0004 two-pass parity): same resolver, same
 * pre-collapse prepared spans, no diagnostics collector (diagnostics are owned by the visual pass).
 * @internal
 */
export const getResolvedTraceAnnotationsSelector = createCustomCachedSelector(
  [getNormalizedSpans, getTraceAnnotationSpecsSelector],
  (pipeline, annotationSpecs): ResolvedTraceAnnotation[] => {
    if (!pipeline) return [];
    return resolveTraceAnnotations(pipeline.orderedSpans, annotationSpecs, pipeline.projectionOffset);
  },
);

/**
 * Rows for `ScreenReaderTraceTable`. Each row carries formatted duration strings so the table
 * component needs no formatting logic of its own.
 * @internal
 */
export const getTraceTableRowsSelector = createCustomCachedSelector(
  [getNormalizedSpans],
  (pipeline): TraceTableRow[] => {
    if (!pipeline) return [];
    const { spans, disclosure, domain } = pipeline;
    // Build a lookup map for parent name resolution (O(N) — same spans array).
    const nameById = new Map<string, string>(spans.map((s) => [s.id, s.name]));
    return spans.map((span, laneIndex): TraceTableRow => {
      const discEntry = disclosure.get(laneIndex);
      const hiddenCount = discEntry?.state === 'collapsed' ? discEntry.descendantCount : 0;
      const adjustedName = span.skewCorrected ? `${span.name} (clock skew adjusted)` : span.name;
      // Append hidden-descendant count to the name for AT parity (collapsed parent rows).
      const name = hiddenCount > 0 ? `${adjustedName} (${hiddenCount} descendants hidden)` : adjustedName;
      // Span badges for AT (Spec 27): the full resolved set (including any visually omitted by
      // overflow), with accessible names. Each carries its pre-built keyboard-activation event
      // (coordinate-free) dispatched as-is through `Settings.onElementClick`.
      const badges: TraceTableBadge[] = (span.badges ?? []).map((badge, i) => ({
        id: String(badge.id),
        ariaLabel: resolveBadgeAriaLabel(badge, i),
        event: buildTraceBadgeEvent(badge, span),
      }));
      return {
        id: span.id,
        name,
        totalDuration: formatMs(span.end - span.start),
        selfTime: formatMs(computeSelfTime(span)),
        startOffset: `+${formatMs(span.start - domain.min)}`,
        // Partial-trace disclosure (Spec 26) is folded into the parent description.
        parentName: describeParent(span, nameById),
        badges,
      };
    });
  },
);
