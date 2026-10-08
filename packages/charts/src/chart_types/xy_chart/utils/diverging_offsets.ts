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

import { StackMode } from './specs';
import { clamp } from '../../../utils/common';

interface StackColumns {
  columns: readonly (readonly number[])[];
  series: ArrayLike<number>;
  y0: Float64Array;
  y1: Float64Array;
}

type StackOffset = (stack: StackColumns) => void;

/**
 * Computes required wiggle offset for each x value __WITHOUT__ mutations
 */
function wiggleOffsets({ columns, series, y1 }: StackColumns): number[] {
  const offsets = [];
  let y = 0;
  for (let j = 1; j < columns.length; ++j) {
    const previous = columns[j - 1]!;
    const current = columns[j]!;
    let p = 0;
    let q = 0;
    let s1 = 0;
    let s2 = 0;
    let prefix = 0;
    // sorted-list merge join with a running prefix sum, now O(N)
    while (p < previous.length || q < current.length) {
      const previousSeries = p < previous.length ? series[previous[p]!]! : Infinity;
      const currentSeries = q < current.length ? series[current[q]!]! : Infinity;
      const sij1 = previousSeries <= currentSeries ? y1[previous[p++]!]! || 0 : 0;
      const sij0 = currentSeries <= previousSeries ? y1[current[q++]!]! || 0 : 0;
      const s3 = (sij0 - sij1) / 2 + prefix;
      prefix += sij0 - sij1;
      s1 += sij0;
      s2 += s3 * sij0;
    }

    offsets.push(y);
    if (s1) y -= s2 / s1;
  }
  offsets.push(y);
  return offsets;
}

const divergingOffset =
  (baseline: 'zero' | 'silhouette' | 'wiggle'): StackOffset =>
  (stack) => {
    const { columns, y0, y1 } = stack;
    const offsets = baseline === 'wiggle' ? wiggleOffsets(stack) : [];
    for (let j = 0; j < columns.length; ++j) {
      const column = columns[j]!;
      // sum negative values per x before to maintain original sort for negative values
      let yn = 0;
      let sumYn = 0;
      let sumYp = 0;
      for (const c of column) {
        const dy = y1[c]! - y0[c]!;
        if (dy < 0) {
          sumYn += Math.abs(y1[c]!) || 0;
          yn += dy;
        } else {
          sumYp += y1[c]! || 0;
        }
      }

      let yp: number;
      if (baseline === 'wiggle') {
        const offset = offsets[j] ?? 0;
        yp = offset + sumYn;
        yn = offset;
      } else {
        yp = baseline === 'silhouette' ? -(sumYp / 2 - sumYn / 2) : 0;
        yn += yp;
      }

      for (const c of column) {
        const dy = y1[c]! - y0[c]!;
        if (dy >= 0) {
          y0[c] = yp;
          y1[c] = yp += dy;
        } else {
          y1[c] = yn;
          y0[c] = yn -= dy;
        }
      }
    }
  };

/**
 * Stacked offset function with diverging polarity offset
 */
const diverging = divergingOffset('zero');
/**
 * Stacked Silhouette offset function with diverging polarity offset
 */
const divergingSilhouette = divergingOffset('silhouette');

/**
 * Stacked Wiggle offset function to account for diverging offset
 */
const divergingWiggle = divergingOffset('wiggle');

/**
 * Stacked Percentage offset function with diverging polarity offset
 * Treats percentage as participation for mixed polarity data
 */
const divergingPercentage: StackOffset = ({ columns, y0, y1 }) => {
  for (const column of columns) {
    let sumYn = 0;
    let sumYp = 0;
    for (const c of column) {
      if (y1[c]! - y0[c]! < 0) {
        sumYn += Math.abs(y1[c]!) || 0;
      } else {
        sumYp += y1[c]! || 0;
      }
    }

    const sumY = sumYn + sumYp;
    if (sumY === 0) continue; // must not return, else loop will stop

    let yp = sumYn / sumY;
    let yn = 0;

    for (const c of column) {
      const dy = y1[c]! - y0[c]!;
      const participation = Math.abs(dy / sumY);

      if (dy >= 0) {
        y0[c] = yp;
        y1[c] = yp += participation;
      } else {
        y0[c] = yn;
        y1[c] = yn += participation;
      }
    }
  }
};

const stackOffsetWiggle: StackOffset = (stack) => {
  const { columns, y0, y1 } = stack;
  const offsets = wiggleOffsets(stack);

  for (let j = 0; j < columns.length; ++j) {
    let base = offsets[j] ?? 0;
    for (const c of columns[j]!) {
      y1[c] = y1[c]! + (y0[c] = base);
      base = isNaN(y1[c]) ? y0[c] : y1[c];
    }
  }
};

function stackOffset(stackMode: StackMode | undefined, onlyNegative: boolean): StackOffset {
  // TODO: fix diverging wiggle offset for negative polarity data (from https://github.com/elastic/elastic-charts/pull/1502)
  if (onlyNegative && stackMode === StackMode.Wiggle) return stackOffsetWiggle;

  switch (stackMode) {
    case StackMode.Percentage:
      return divergingPercentage;
    case StackMode.Silhouette:
      return divergingSilhouette;
    case StackMode.Wiggle:
      return divergingWiggle;
    default:
      return diverging;
  }
}

/** @internal */
export function stackCells(
  columns: readonly (readonly number[])[],
  series: ArrayLike<number>,
  values: ArrayLike<number>,
  stackMode: StackMode | undefined,
  onlyNegative: boolean,
): { y0: Float64Array; y1: Float64Array } {
  const y0 = new Float64Array(values.length);
  const y1 = Float64Array.from(values);
  stackOffset(stackMode, onlyNegative)({ columns, series, y0, y1 });

  if (stackMode === StackMode.Percentage) {
    /**
     * Due to floating point errors, values computed on a stack
     * could fall out of the current defined domain boundaries.
     * This can particularly happen with percent stacks, where the domain
     * is hardcoded to [0,1] and some values can fall outside that domain.
     */
    for (let c = 0; c < values.length; ++c) {
      y0[c] = clamp(y0[c]!, 0, 1);
      y1[c] = clamp(y1[c]!, 0, 1);
    }
  }
  return { y0, y1 };
}

/* eslint-enable header/header, no-param-reassign */
