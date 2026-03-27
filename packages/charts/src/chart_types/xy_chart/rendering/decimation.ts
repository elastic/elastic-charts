/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { DataSeriesDatum } from '../utils/series';

/**
 * Points-per-pixel multiplier that determines when decimation activates.
 * Decimation is skipped when `data.length <= DECIMATION_THRESHOLD_FACTOR * panelWidth`.
 * Must be at least 4 — the algorithm emits up to 4 points (first, min, max, last) per
 * bucket, so fewer than 4 points per pixel means there is nothing to reduce.
 */
const DECIMATION_THRESHOLD_FACTOR = 4;

/**
 * M4 decimation for ordered series data.
 *
 * Divides the data into pixel-width buckets and retains up to 4 values per
 * bucket: the first, minimum y1, maximum y1, and last. This preserves all
 * visible peaks and valleys while also maintaining the entry and exit points
 * of each pixel column, producing a more accurate line shape than min/max
 * alone.
 *
 * @internal
 */
export function decimateDataSeries(data: DataSeriesDatum[], panelWidth: number): DataSeriesDatum[] {
  if (data.length <= DECIMATION_THRESHOLD_FACTOR * panelWidth) {
    return data;
  }

  const bucketWidth = data.length / panelWidth;
  const result: DataSeriesDatum[] = [];

  for (let bucket = 0; bucket < panelWidth; bucket++) {
    const start = Math.floor(bucket * bucketWidth);
    const end = Math.min(Math.floor((bucket + 1) * bucketWidth), data.length);
    const last = end - 1;

    let minIndex = start;
    let maxIndex = start;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = start; i < end; i++) {
      const y = data[i]!.y1;
      if (y !== null && y < minY) {
        minY = y;
        minIndex = i;
      }
      if (y !== null && y > maxY) {
        maxY = y;
        maxIndex = i;
      }
    }

    // Collect the 4 candidate indices and sort by position to preserve data order
    const indices = [start, minIndex, maxIndex, last];
    indices.sort((a, b) => a - b);

    // Emit each unique index
    let prev = -1;
    for (const idx of indices) {
      if (idx !== prev) {
        result.push(data[idx]!);
        prev = idx;
      }
    }
  }

  return result;
}
