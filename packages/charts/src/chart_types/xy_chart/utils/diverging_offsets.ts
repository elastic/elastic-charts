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

/** @internal */
export interface StackCells {
  columns: readonly (readonly number[])[];
  series: Int32Array;
  values: Float64Array;
}

/** @internal */
export interface StackColumns {
  columns: readonly (readonly number[])[];
  series: Int32Array;
  y0: Float64Array;
  y1: Float64Array;
}

/** @internal */
export type StackOffset = (stack: StackColumns) => void;

/** @internal */
export function stackCells(
  { columns, series, values }: StackCells,
  offset: StackOffset,
): Pick<StackColumns, 'y0' | 'y1'> {
  const y0 = new Float64Array(values.length);
  const y1 = Float64Array.from(values);
  offset({ columns, series, y0, y1 });
  return { y0, y1 };
}

/**
 * Computes required wiggle offset for each x value __WITHOUT__ mutations
 */
function wiggleOffsets({ columns, series, y1 }: StackColumns): number[] {
  const offsets = [];
  const previousValues = new Float64Array(series.length);
  const currentValues = new Float64Array(series.length);
  let y = 0;
  for (let j = 1; j < columns.length; ++j) {
    const previous = columns[j - 1]!;
    const current = columns[j]!;
    let p = 0;
    let q = 0;
    let u = 0;
    while (p < previous.length || q < current.length) {
      const previousSeries = p < previous.length ? series[previous[p]!]! : Infinity;
      const currentSeries = q < current.length ? series[current[q]!]! : Infinity;
      previousValues[u] = previousSeries <= currentSeries ? y1[previous[p++]!]! : 0;
      currentValues[u] = currentSeries <= previousSeries ? y1[current[q++]!]! : 0;
      u++;
    }

    let s1 = 0;
    let s2 = 0;
    for (let i = 0; i < u; ++i) {
      const sij0 = currentValues[i]! || 0;
      const sij1 = previousValues[i]! || 0;
      let s3 = (sij0 - sij1) / 2;

      for (let k = 0; k < i; ++k) {
        const skj0 = currentValues[k]! || 0;
        const skj1 = previousValues[k]! || 0;
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
const divergingOffset =
  (isSilhouette = false): StackOffset =>
  ({ columns, y0, y1 }) => {
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

      const silhouetteOffset = sumYp / 2 - sumYn / 2;
      const offset = isSilhouette ? -silhouetteOffset : 0;
      yn += offset;

      let yp = offset;
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
export const divergingWiggle: StackOffset = (stack) => {
  const { columns, series, y0, y1 } = stack;
  if (!(series.length > 0)) return;

  const offsets = wiggleOffsets(stack);

  for (let j = 0; j < columns.length; ++j) {
    const column = columns[j]!;
    // sum negative values per x before to maintain original sort for negative values
    let sumYn = 0;
    for (const c of column) {
      if (y1[c]! - y0[c]! < 0) {
        sumYn += Math.abs(y1[c]!) || 0;
      }
    }

    const offset = offsets[j] ?? 0;
    let yp = offset + sumYn;
    let yn = offset;
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
 * Stacked Percentage offset function with diverging polarity offset
 * Treats percentage as participation for mixed polarity data
 * @internal
 */
export const divergingPercentage: StackOffset = ({ columns, y0, y1 }) => {
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

/** @internal */
export const stackOffsetWiggle: StackOffset = (stack) => {
  const { columns, series, y0, y1 } = stack;
  if (!(series.length > 0)) return;

  const offsets = wiggleOffsets(stack);

  for (let j = 0; j < columns.length; ++j) {
    let base = offsets[j] ?? 0;
    for (const c of columns[j]!) {
      y1[c] = y1[c]! + (y0[c] = base);
      base = isNaN(y1[c]) ? y0[c] : y1[c];
    }
  }
};

/* eslint-enable header/header, no-param-reassign */
