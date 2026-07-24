/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../../common/colors';
import type { TraceColorAccessor, TraceDatum } from '../trace_api';

/**
 * Builds a map from color-group key → palette color by iterating `data` once in order.
 * Keys are assigned cyclic palette indices in first-seen order — the same color-group key
 * always maps to the same palette entry regardless of which trace or view is active, because
 * the map is built over the full input before any `traceId` filtering (cross-trace color stability).
 *
 * When `vizColors` is empty the returned map is empty: every lookup misses and the renderer falls
 * through to the themed `activeSegmentColor` default.
 *
 * Mirrors the running-counter cyclic pattern of `getSeriesColors` in
 * `packages/charts/src/chart_types/xy_chart/utils/series.ts`.
 * @internal
 */
export function buildColorMap(
  data: TraceDatum[],
  colorBy: TraceColorAccessor,
  vizColors: Color[],
): Map<string, Color> {
  const map = new Map<string, Color>();
  if (vizColors.length === 0) return map;

  let counter = 0;
  for (const datum of data) {
    const key = colorBy(datum);
    if (key === undefined || map.has(key)) continue;
    map.set(key, vizColors[counter % vizColors.length]!);
    counter++;
  }
  return map;
}

/**
 * Builds a map from segment label → palette color by iterating all active segments of all spans
 * in first-seen order. Segments sharing the same label get the same color across every span.
 *
 * Built over the full input before any `traceId` filtering so that a given label keeps the same
 * palette color regardless of which trace is currently shown (cross-trace label stability — same
 * rationale as {@link buildColorMap}).
 *
 * When `vizColors` is empty the returned map is empty: every label-lookup misses and segments fall
 * through to the span-level color or the themed `activeSegmentColor` default.
 * @internal
 */
export function buildSegmentColorMap(data: TraceDatum[], vizColors: Color[]): Map<string, Color> {
  const map = new Map<string, Color>();
  if (vizColors.length === 0) return map;

  let counter = 0;
  for (const datum of data) {
    for (const segment of (datum.activeSegments ?? [])) {
      const label = segment.label;
      if (label === undefined || map.has(label)) continue;
      map.set(label, vizColors[counter % vizColors.length]!);
      counter++;
    }
  }
  return map;
}
