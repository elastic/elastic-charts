/* eslint-disable header/header, no-param-reassign */

/**
 * @notice
 * This product includes code that is adapted from d3-shape@3.0.1,
 * which is available under a "ISC" license.
 *
 * ISC License
 *
 * Copyright 2010-2021 Mike Bostock
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.

 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */

import type { DataSeriesDatum } from './series';
import type { SeriesKey } from '../../../common/series_id';

type XValue = string | number;
type SeriesValueMap = Map<SeriesKey, DataSeriesDatum>;

/** @internal */
export type XValueMap = Map<XValue, SeriesValueMap>;
/** @internal */
export type StackPoint = [y0: number, y1: number];
/** @internal */
export type StackLayer = StackPoint[];
/** @internal */
export type StackOffset = (series: StackLayer[]) => void;

/** @internal */
export function stackLayers(values: ReadonlyArray<ArrayLike<number>>, offset: StackOffset): StackLayer[] {
  const layers: StackLayer[] = [];
  for (const row of values) {
    const layer: StackLayer = [];
    for (let j = 0; j < row.length; ++j) {
      layer.push([0, row[j]!]);
    }
    layers.push(layer);
  }
  offset(layers);
  return layers;
}

/**
 * Computes required wiggle offset for each x value __WITHOUT__ mutations
 */
function wiggleOffsets(series: StackLayer[]): number[] {
  const offsets = [];
  let y, j;
  for (y = 0, j = 1; j < (series[0]?.length ?? 0); ++j) {
    let i, s1, s2;
    for (i = 0, s1 = 0, s2 = 0; i < series.length; ++i) {
      const si = series[i]!;
      const sij0 = si[j]?.[1] || 0;
      const sij1 = si[j - 1]?.[1] || 0;
      let s3 = (sij0 - sij1) / 2;

      for (let k = 0; k < i; ++k) {
        const sk = series[k]!;
        const skj0 = sk[j]?.[1] || 0;
        const skj1 = sk[j - 1]?.[1] || 0;
        s3 += skj0 - skj1;
      }
      s1 += sij0;
      s2 += s3 * sij0;
    }

    offsets.push(y);
    if (s1) y -= s2 / s1;
  }
  offsets.push(y);
  return offsets;
}

/** @internal */
const divergingOffset = (isSilhouette = false) => {
  return function (series: StackLayer[]): void {
    const n = series.length;
    if (!(n > 0)) return;
    for (let i, j = 0, sumYn, sumYp, yp, yn = 0, s0 = series[0], m = s0?.length ?? 0; j < m; ++j) {
      // sum negative values per x before to maintain original sort for negative values
      for (yn = 0, sumYn = 0, sumYp = 0, i = 0; i < n; ++i) {
        const d = series[i]![j]!;
        const dy = d[1] - d[0];
        if (dy < 0) {
          sumYn += Math.abs(d[1]) || 0;
          yn += dy;
        } else {
          sumYp += d[1] || 0;
        }
      }

      const silhouetteOffset = sumYp / 2 - sumYn / 2;
      const offset = isSilhouette ? -silhouetteOffset : 0;
      yn += offset;

      for (yp = offset, i = 0; i < n; ++i) {
        const d = series[i]![j]!;
        const dy = d[1] - d[0];
        if (dy >= 0) {
          d[0] = yp;
          d[1] = yp += dy;
        } else {
          d[1] = yn;
          d[0] = yn -= dy;
        }
      }
    }
  };
};

/**
 * Stacked offset function with diverging polarity offset
 * @internal
 */
export const diverging = divergingOffset();
/**
 * Stacked Silhouette offset function with diverging polarity offset
 * @internal
 */
export const divergingSilhouette = divergingOffset(true);

/**
 * Stacked Wiggle offset function to account for diverging offset
 * @internal
 */
export function divergingWiggle(series: StackLayer[]): void {
  const n = series.length;
  const s0 = series[0];
  const m = s0?.length ?? 0;
  if (!(n > 0) || !(m > 0)) return diverging(series);

  const offsets = wiggleOffsets(series);

  for (let i, j = 0, sumYn, yp, yn = 0; j < m; ++j) {
    // sum negative values per x before to maintain original sort for negative values
    for (i = 0, yn = 0, sumYn = 0; i < n; ++i) {
      const d = series[i]![j]!;
      if (d[1] - d[0] < 0) {
        sumYn += Math.abs(d[1]) || 0;
      }
    }

    const offset = offsets[j] ?? 0;
    yn += offset;

    for (yp = offset + sumYn, yn = offset, i = 0; i < n; ++i) {
      const d = series[i]![j]!;
      const dy = d[1] - d[0];
      if (dy >= 0) {
        d[0] = yp;
        d[1] = yp += dy;
      } else {
        d[1] = yn;
        d[0] = yn -= dy;
      }
    }
  }
}

/**
 * Stacked Percentage offset function with diverging polarity offset
 * Treats percentage as participation for mixed polarity data
 * @internal
 */
export function divergingPercentage(series: StackLayer[]): void {
  const n = series.length;
  if (!(n > 0)) return;
  for (let i, j = 0, sumYn, sumYp; j < (series[0]?.length ?? 0); ++j) {
    for (sumYn = sumYp = i = 0; i < n; ++i) {
      const d = series[i]![j]!;
      if (d[1] - d[0] < 0) {
        sumYn += Math.abs(d[1]) || 0;
      } else {
        sumYp += d[1] || 0;
      }
    }

    const sumY = sumYn + sumYp;
    if (sumY === 0) continue; // must not return, else loop will stop

    let yp = sumYn / sumY;
    let yn = 0;

    for (i = 0; i < n; ++i) {
      const d = series[i]![j]!;
      const dy = d[1] - d[0];
      const participation = Math.abs(dy / sumY);

      if (dy >= 0) {
        d[0] = yp;
        d[1] = yp += participation;
      } else {
        d[0] = yn;
        d[1] = yn += participation;
      }
    }
  }
}

function stackOffsetNone(series: StackLayer[]): void {
  const n = series.length;
  if (!(n > 1)) return;
  let s1 = series[0]!;
  const m = s1.length;
  for (let i = 1; i < n; ++i) {
    const s0 = s1;
    s1 = series[i]!;
    for (let j = 0; j < m; ++j) {
      const d0 = s0[j]!;
      const d1 = s1[j]!;
      d1[1] += d1[0] = isNaN(d0[1]) ? d0[0] : d0[1];
    }
  }
}

/** @internal */
export function stackOffsetWiggle(series: StackLayer[]): void {
  const n = series.length;
  if (!(n > 0)) return;
  const s0 = series[0]!;
  const m = s0.length;
  if (!(m > 0)) return;
  let y = 0;
  let j = 1;
  for (; j < m; ++j) {
    let s1 = 0;
    let s2 = 0;
    for (let i = 0; i < n; ++i) {
      const si = series[i]!;
      const sij0 = si[j]![1] || 0;
      const sij1 = si[j - 1]![1] || 0;
      let s3 = (sij0 - sij1) / 2;
      for (let k = 0; k < i; ++k) {
        const sk = series[k]!;
        const skj0 = sk[j]![1] || 0;
        const skj1 = sk[j - 1]![1] || 0;
        s3 += skj0 - skj1;
      }
      s1 += sij0;
      s2 += s3 * sij0;
    }
    const previous = s0[j - 1]!;
    previous[1] += previous[0] = y;
    if (s1) y -= s2 / s1;
  }
  const last = s0[j - 1]!;
  last[1] += last[0] = y;
  stackOffsetNone(series);
}

/* eslint-enable header/header, no-param-reassign */
