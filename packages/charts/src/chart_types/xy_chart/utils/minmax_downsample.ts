/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Min and max per pixel column. Each column emits up to two original rows.
 * @internal
 */
export function pixelBucketCount(pixelWidth: number): number {
  return Math.max(0, Math.floor(pixelWidth));
}

/**
 * Reduce a series to the y envelope that fits in `bucketCount` columns: first,
 * last, and the min/max y in each x-range bucket. Original row references are
 * kept; nothing is copied.
 *
 * Null / non-finite y is not used for extrema. One such row is kept per bucket
 * so line/area gaps still break the path.
 *
 * @internal
 */
export function minMaxDownsample<T>(
  data: readonly T[],
  getX: (datum: T) => unknown,
  getY: (datum: T) => unknown,
  bucketCount: number,
): { data: T[]; minInterval: number; xMin: number } {
  const n = data.length;
  if (bucketCount <= 0 || n === 0 || n <= bucketCount * 2) {
    return { data: data as T[], minInterval: minAdjacentInterval(data, getX), xMin: NaN };
  }

  let xMin = Infinity;
  let xMax = -Infinity;
  let firstValid = -1;
  let lastValid = -1;
  let minInterval = Infinity;
  let prevX: number | undefined;

  for (let i = 0; i < n; i++) {
    const datum = data[i];
    if (datum === undefined) continue;
    const x = getX(datum);
    if (typeof x !== 'number' || !Number.isFinite(x)) continue;
    if (firstValid === -1) firstValid = i;
    lastValid = i;
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (prevX !== undefined) {
      const dx = Math.abs(x - prevX);
      if (dx > 0 && dx < minInterval) minInterval = dx;
    }
    prevX = x;
  }

  if (firstValid === -1 || lastValid === -1 || !Number.isFinite(xMin) || !Number.isFinite(xMax)) {
    return { data: data as T[], minInterval, xMin };
  }

  if (xMin === xMax) {
    return { data: [data[firstValid]!, data[lastValid]!], minInterval, xMin };
  }

  const lastBucket = bucketCount - 1;
  const span = xMax - xMin;
  const minI = new Int32Array(bucketCount).fill(-1);
  const maxI = new Int32Array(bucketCount).fill(-1);
  const gapI = new Int32Array(bucketCount).fill(-1);
  const minY = new Float64Array(bucketCount).fill(Infinity);
  const maxY = new Float64Array(bucketCount).fill(-Infinity);

  for (let i = 0; i < n; i++) {
    const datum = data[i];
    if (datum === undefined) continue;
    const x = getX(datum);
    if (typeof x !== 'number' || !Number.isFinite(x)) continue;
    const bucket = Math.min(lastBucket, Math.floor(((x - xMin) / span) * lastBucket));
    const y = finiteY(getY(datum));
    if (y === null) {
      if (gapI[bucket] === -1) gapI[bucket] = i;
      continue;
    }
    if (y < minY[bucket]!) {
      minY[bucket] = y;
      minI[bucket] = i;
    }
    if (y > maxY[bucket]!) {
      maxY[bucket] = y;
      maxI[bucket] = i;
    }
  }

  const keep = new Set<number>();
  keep.add(firstValid);
  keep.add(lastValid);
  for (let b = 0; b < bucketCount; b++) {
    const lo = minI[b]!;
    const hi = maxI[b]!;
    const gap = gapI[b]!;
    if (lo !== -1) keep.add(lo);
    if (hi !== -1) keep.add(hi);
    if (gap !== -1) keep.add(gap);
  }

  const indexes = [...keep].sort((a, b) => a - b);
  return {
    data: indexes.map((i) => data[i]!),
    minInterval,
    xMin,
  };
}

function finiteY(value: unknown): number | null {
  const n = Number(value ?? undefined);
  return Number.isFinite(n) ? n : null;
}

function minAdjacentInterval<T>(data: readonly T[], getX: (datum: T) => unknown): number {
  let minInterval = Infinity;
  let prevX: number | undefined;
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    if (datum === undefined) continue;
    const x = getX(datum);
    if (typeof x !== 'number' || !Number.isFinite(x)) continue;
    if (prevX !== undefined) {
      const dx = Math.abs(x - prevX);
      if (dx > 0 && dx < minInterval) minInterval = dx;
    }
    prevX = x;
  }
  return minInterval;
}
