/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleLinear } from 'd3-scale';

import { clamp, isNil } from '../../../../../utils/common';
import { MIN_TICK_COUNT, MAX_TICK_COUNT } from '../constants';

const COLOR_TICK_OFFSET = -1;

/** @internal */
export function getColorBandSizes(
  length: number,
  tickInterval: number,
  scale: ScaleLinear<number, number>,
  totalBandLength?: number,
): {
  colorTicks: number[];
  colorBandSize: number;
  colorBandSizeValue: number;
} {
  const maxTicks = maxTicksByLength(length, tickInterval);
  const colorTicks = scale.ticks(maxTicks + COLOR_TICK_OFFSET);
  const colorBandSize = (totalBandLength ?? length) / colorTicks.length;

  return {
    colorTicks,
    colorBandSize,
    colorBandSizeValue: !isNil(totalBandLength) ? totalBandLength / colorTicks.length : scale.invert(colorBandSize),
  };
}

function maxTicksByLength(length: number, interval: number) {
  const target = Math.floor(length / interval);
  return clamp(target, MIN_TICK_COUNT, MAX_TICK_COUNT);
}
