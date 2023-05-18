/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getLinearTicks } from '../chart_types/xy_chart/utils/get_linear_ticks';

/** @internal */
export function getLinearNonDenserTicks(
  start: number,
  stop: number,
  count: number,
  base: number,
  minInterval: number,
): number[] {
  let currentCount = count;
  let ticks = getLinearTicks(start, stop, count, base);
  while (ticks.length > 2 && currentCount > 0 && (ticks[1] ?? NaN) - (ticks[0] ?? NaN) < minInterval) {
    currentCount--;
    ticks = getLinearTicks(start, stop, currentCount, base);
  }
  return ticks;
}
