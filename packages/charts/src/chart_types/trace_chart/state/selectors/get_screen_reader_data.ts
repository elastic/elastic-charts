/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/spec_type';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { EMPTY_SCREEN_READER_ITEMS, type ScreenReaderItem } from '../../../../state/selectors/get_screenreader_data';
import { getSpecsFromStore } from '../../../../state/utils/get_specs_from_store';
import { buildDisclosureMap, collapseLanes, collapsibleParentIds } from '../../data/collapse';
import { normalize } from '../../data/normalize';
import { orderLanes } from '../../data/order_lanes';
import { resolveActive } from '../../data/self_time';
import type { NormalizedSpan } from '../../data/types';
import { computeSelfTime, formatMs } from '../../render/tooltip';
import type { TraceSpec } from '../../trace_api';

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
    disclosure: Map<number, { state: 'collapsed' | 'expanded'; depth: number; descendantCount: number }>;
    domain: { min: number; max: number };
  } | null => {
    if (!spec || spec.data.length === 0) return null;
    const result = normalize(spec.data, spec.xScaleType, spec.traceId, spec.colorBy, vizColors);
    const { lanes: orderedSpans, depthBySpan } = orderLanes(resolveActive(result.spans), spec.laneOrder ?? 'tree');
    // Apply collapse (controlled prop only; uncontrolled local state is not in redux).
    const effectiveCollapsed = new Set(spec.collapsedSpanIds ?? []);
    const spans = collapseLanes(orderedSpans, effectiveCollapsed);
    const parentIds = collapsibleParentIds(orderedSpans);
    const disclosure = buildDisclosureMap(orderedSpans, spans, effectiveCollapsed, depthBySpan, parentIds);
    return { spans, disclosure, domain: result.domain };
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
      return {
        id: span.id,
        name,
        totalDuration: formatMs(span.end - span.start),
        selfTime: formatMs(computeSelfTime(span)),
        startOffset: `+${formatMs(span.start - domain.min)}`,
        // Partial-trace disclosure (Spec 26) is folded into the parent description.
        parentName: describeParent(span, nameById),
      };
    });
  },
);
