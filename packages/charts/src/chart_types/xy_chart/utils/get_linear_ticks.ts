/* eslint-disable header/header, no-param-reassign */

/**
 * @notice
 * This product includes code that is adapted from d3-array@3.0.4 and d3-scale@4.0.2,
 * which are both available under a "ISC" license.
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

import type { ScaleContinuousNumeric } from 'd3-scale';

import { isNil } from '../../../utils/common';
import type { PrimitiveValue } from '../../partition_chart/layout/utils/group_by_rollup';

const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);

/** @internal */
export function getLinearTicks(start: number, stop: number, count: number, base: number = 2): number[] {
  let reverse,
    i = -1,
    n,
    ticks,
    step;

  stop = +stop;
  start = +start;
  count = +count;
  if (start === stop && count > 0) return [start];
  if ((reverse = stop < start)) {
    n = start;
    start = stop;
    stop = n;
  }
  if ((step = tickIncrement(start, stop, count, base)) === 0 || !isFinite(step)) return [];

  if (step > 0) {
    let r0 = Math.round(start / step),
      r1 = Math.round(stop / step);
    if (r0 * step < start) ++r0;
    if (r1 * step > stop) --r1;
    ticks = new Array((n = r1 - r0 + 1));
    while (++i < n) ticks[i] = (r0 + i) * step;
  } else {
    step = -step;
    let r0 = Math.round(start * step),
      r1 = Math.round(stop * step);
    if (r0 / step < start) ++r0;
    if (r1 / step > stop) --r1;
    ticks = new Array((n = r1 - r0 + 1));
    while (++i < n) ticks[i] = (r0 + i) / step;
  }

  if (reverse) ticks.reverse();

  return ticks;
}

function tickIncrement(start: number, stop: number, count: number, base: number = 10) {
  const step = (stop - start) / Math.max(0, count);
  const power = Math.floor(Math.log(step) / Math.log(base) + Number.EPSILON);
  const error = step / Math.pow(base, power);
  return power >= 0
    ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(base, power)
    : -Math.pow(base, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

/** @internal */
export function getNiceLinearTicks(
  scale: ScaleContinuousNumeric<PrimitiveValue, number>,
  count: number = 10,
  base = 10,
) {
  const d = scale.domain();
  let i0 = 0;
  let i1 = d.length - 1;
  let start = d[i0];
  let stop = d[i1];
  let prestep;
  let step;
  let maxIter = 10;

  if (isNil(stop) || isNil(start)) {
    return scale;
  }

  if (stop < start) {
    step = start;
    start = stop;
    stop = step;

    step = i0;
    i0 = i1;
    i1 = step;
  }

  while (maxIter-- > 0) {
    step = tickIncrement(start, stop, count, base);
    if (step === prestep) {
      d[i0] = start;
      d[i1] = stop;
      return scale.domain(d);
    } else if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    } else {
      break;
    }
    prestep = step;
  }

  return scale;
}

/* eslint-enable header/header, no-param-reassign */
