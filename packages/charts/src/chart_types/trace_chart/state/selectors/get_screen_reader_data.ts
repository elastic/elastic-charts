/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTraceAnnotationSpecsSelector } from './get_annotation_specs';
import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/spec_type';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { EMPTY_SCREEN_READER_ITEMS, type ScreenReaderItem } from '../../../../state/selectors/get_screenreader_data';
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
import { buildTraceSpanBadgeEventSpan, computeSelfTime, formatMs } from '../../render/tooltip';
import type { TraceSpanBadge, TraceSpanBadgeEventSpan, TraceSpec } from '../../trace_api';

/**
 * One Span badge as exposed to assistive technology in the screen-reader table (Spec 27). Carries the
 * resolved accessible name plus the badge and owning-span references needed to build a keyboard
 * `onBadgeClick` event. Includes badges omitted from the visual layout for overflow — assistive tech
 * always sees the full set.
 * @internal
 */
export interface TraceTableBadge {
  id: string;
  ariaLabel: string;
  /** The resolved badge, returned by reference in the keyboard activation event. */
  badge: TraceSpanBadge;
  /** The owning span's metadata, carried in the keyboard activation event. */
  span: TraceSpanBadgeEventSpan;
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
  ],
  (
    spec,
    vizColors,
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
    const result = normalize(spec.data, spec.xScaleType, spec.traceId, spec.colorBy, vizColors);
    // Second badge call site (ADR 0004): resolve the same Span badges as the visual pipeline so the
    // screen-reader table exposes identical badges. Diagnostics are not surfaced yet (Spec 28 phase).
    const withBadges = resolveSpanBadges(result.spans, spec.badgeAccessor);
    const { lanes: orderedSpans, depthBySpan } = orderLanes(resolveActive(withBadges), spec.laneOrder ?? 'tree');
    // Apply collapse (controlled prop only; uncontrolled local state is not in redux).
    const effectiveCollapsed = new Set(spec.collapsedSpanIds ?? []);
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
 * Rows for `ScreenReaderTraceTable`. Each row carries formatted duration strings so the table
 * component needs no formatting logic of its own.
 * @internal
 */
/**
 * The Trace spec's `onBadgeClick` handler, or `undefined` when none is supplied. Drives whether the
 * screen-reader table renders Span badges as keyboard-activatable `<button>` controls (handler
 * present) or inert informational text (Spec 27).
 * @internal
 */
export const getTraceBadgeClickHandlerSelector = createCustomCachedSelector(
  [(state: GlobalChartState) => getSpecsFromStore<TraceSpec>(state.specs, ChartType.Trace, SpecType.Series)[0]],
  (spec): TraceSpec['onBadgeClick'] => spec?.onBadgeClick,
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
 * The Trace spec's `onAnnotationClick` handler, or `undefined` when none is supplied. Drives whether
 * the screen-reader surface renders annotations as keyboard-activatable `<button>` controls (handler
 * present) or inert informational text (Spec 29).
 * @internal
 */
export const getTraceAnnotationClickHandlerSelector = createCustomCachedSelector(
  [(state: GlobalChartState) => getSpecsFromStore<TraceSpec>(state.specs, ChartType.Trace, SpecType.Series)[0]],
  (spec): TraceSpec['onAnnotationClick'] => spec?.onAnnotationClick,
);

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
      // overflow), with accessible names. The owning-span metadata is built once per span and shared
      // across its badges for the keyboard activation event.
      const eventSpan = span.badges && span.badges.length > 0 ? buildTraceSpanBadgeEventSpan(span) : undefined;
      const badges: TraceTableBadge[] = (span.badges ?? []).map((badge, i) => ({
        id: String(badge.id),
        ariaLabel: resolveBadgeAriaLabel(badge, i),
        badge,
        span: eventSpan!,
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
