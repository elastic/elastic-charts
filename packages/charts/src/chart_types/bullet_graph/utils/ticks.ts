/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { clamp, isFiniteNumber } from '../../../utils/common';
import { MAX_TICK_COUNT, MIN_TICK_COUNT } from '../renderer/canvas/constants';
import { BulletDatum } from '../spec';

/** @internal */
export interface TickOptions {
  nice?: boolean;
  interval: number;
  desiredTicks: BulletDatum['ticks'];
  /**
   * Amplifies range by constant, use for angular to convert angles to arc lengths
   */
  rangeMultiplier?: number;
}

/** @internal */
export function getTickCount(length: number, { desiredTicks, interval }: Omit<TickOptions, 'nice'>) {
  if ((isFiniteNumber(desiredTicks) && desiredTicks > 0) || typeof desiredTicks === 'function') return desiredTicks;
  const target = Math.floor(length / interval);
  return clamp(target, MIN_TICK_COUNT, MAX_TICK_COUNT);
}
