/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

/** @internal */
export const TimeFunction = Object.freeze({
  /**
   * Animation with the same speed from start to end
   */
  linear: 'linear' as const,
  // TODO add timing functions
  // ease - Animation with a slow start, then fast, then end slowly (this is default)
  // linear - Animation with the same speed from start to end
  // ease-in - Animation with a slow start
  // ease-out - Animation with a slow end
  // ease-in-out - Animation with a slow start and end
});
/** @internal */
export type TimeFunction = $Values<typeof TimeFunction>;

/** @internal */
export type TimingFunction = (time: number) => number;

/** @internal */
export interface TimingFunctionValues {
  y0?: number;
  y1?: number;
  t0?: number;
  t1?: number;
}

/** @internal */
export class TimingFunctions {
  static linear({ y0 = 0, y1 = 0, t0 = 0, t1 = 0 }: TimingFunctionValues): TimingFunction {
    return (t: number) => y0 + (t - t0) * ((y1 - y0) / (t1 - t0));
  }
}
