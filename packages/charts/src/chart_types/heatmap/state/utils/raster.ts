/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bisectRight } from 'd3-array';

import { ScaleType } from '../../../../scales/constants';
import { addIntervalToTime, roundDateToESInterval } from '../../../../utils/chrono/elasticsearch';
import { isFiniteNumber } from '../../../../utils/common';
import type { HeatmapSpec, RasterLinearScale, RasterTimeScale } from '../../specs/heatmap';

type HeatmapScale = HeatmapSpec['xScale'] | NonNullable<HeatmapSpec['yScale']>;

/** @internal */
export type RasterScale = RasterTimeScale | RasterLinearScale;

/** @internal */
export function isRasterScale(scale: HeatmapScale): scale is RasterScale {
  if (scale.type === ScaleType.Time) return true;
  if (scale.type !== ScaleType.Linear || !('interval' in scale)) return false;
  return isFiniteNumber(scale.interval) && scale.interval > 0;
}

/** @internal */
export function addRasterInterval(scale: RasterScale, value: number, timeZone: string): number {
  return scale.type === ScaleType.Time
    ? addIntervalToTime(value, scale.interval, timeZone)
    : addLinearInterval(scale, value);
}

function addLinearInterval(scale: RasterLinearScale, value: number): number {
  return roundFloatError(value + scale.interval);
}

/**
 * @internal
 */
export function findLinearBinIndex(scale: RasterLinearScale, bins: number[], value: number): number {
  const roundedValue = roundFloatError(value);
  const index = bisectRight(bins, roundedValue) - 1;
  const bin = bins[index];
  if (bin === undefined) return -1;
  const binEnd = bins[index + 1] ?? addLinearInterval(scale, bin);
  return roundedValue < binEnd ? index : -1;
}

/**
 * Matches the bins overlapping the custom domain.
 * @internal
 */
export function getRasterDomainFilter(
  scale: HeatmapScale,
  timeZone: string,
): ((value: string | number) => boolean) | undefined {
  if (!isRasterScale(scale) || !scale.domain) return undefined;
  const { min, max } = scale.domain;
  const lower = min === undefined ? -Infinity : min;
  const upper = max === undefined ? Infinity : max;
  if (upper <= lower) return () => false;
  if (scale.type === ScaleType.Time) {
    // snapping the bound once avoids adding a calendar interval to every datum
    const timeLower = min === undefined ? -Infinity : roundDateToESInterval(min, scale.interval, 'start', timeZone);
    return (value) => isFiniteNumber(value) && value >= timeLower && value < upper;
  }
  return (value) => isFiniteNumber(value) && addRasterInterval(scale, value, timeZone) > lower && value < upper;
}

/**
 * Generates the bins `anchor + k * interval` overlapping `[min, max)`.
 * @internal
 */
export function linearRange(min: number, max: number, interval: number, anchor: number): number[] {
  const first = Math.floor(roundFloatError((min - anchor) / interval));
  const end = Math.ceil(roundFloatError((max - anchor) / interval));
  return Array.from({ length: Math.max(end - first, 0) }, (_, i) => roundFloatError(anchor + (first + i) * interval));
}

/** generated bins must match the data values, e.g. 0.1 + 2 * 0.1 = 0.30000000000000004 */
function roundFloatError(value: number): number {
  return Number(value.toPrecision(15));
}
