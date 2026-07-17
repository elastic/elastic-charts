/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { normalize } from '../../data/normalize';
import { orderLanes } from '../../data/order_lanes';
import { resolveActive } from '../../data/self_time';
import type { NormalizedSpan } from '../../data/types';
import { computeSelfTime, formatMs } from '../../render/tooltip';
import { ChartType } from '../../..';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { GlobalChartState } from '../../../../state/chart_state';
import { getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { EMPTY_SCREEN_READER_ITEMS, type ScreenReaderItem } from '../../../../state/selectors/get_screenreader_data';
import { getSpecsFromStore } from '../../../../state/utils/get_specs_from_store';
import { SpecType } from '../../../../specs/spec_type';
import type { TraceSpec } from '../../trace_api';

/**
 * One row of the screen-reader trace table.
 * @internal
 */
export interface TraceTableRow {
  name: string;
  totalDuration: string;
  selfTime: string;
  startOffset: string;
  parentName: string;
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
  (spec, vizColors): { spans: NormalizedSpan[]; domain: { min: number; max: number } } | null => {
    if (!spec || spec.data.length === 0) return null;
    const result = normalize(spec.data, spec.xScaleType, spec.traceId, spec.colorBy, vizColors);
    const spans = orderLanes(resolveActive(result.spans), spec.laneOrder ?? 'tree');
    return { spans, domain: result.domain };
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
    const { spans, domain } = pipeline;
    // Build a lookup map for parent name resolution (O(N) — same spans array).
    const nameById = new Map<string, string>(spans.map((s) => [s.id, s.name]));
    return spans.map((span): TraceTableRow => ({
      name: span.name,
      totalDuration: formatMs(span.end - span.start),
      selfTime: formatMs(computeSelfTime(span)),
      startOffset: `+${formatMs(span.start - domain.min)}`,
      parentName: span.parentId != null ? (nameById.get(span.parentId) ?? '—') : '—',
    }));
  },
);
