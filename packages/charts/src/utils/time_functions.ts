/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import bezier from 'bezier-easing';
import { $Values } from 'utility-types';

/** @internal */
export const TimeFunction = Object.freeze({
  /**
   * Animation with the same speed from start to end
   */
  linear: 'linear' as const,
  /**
   * Animation with a slow start, then fast, then end slowly (this is default)
   */
  ease: 'ease' as const,
  /**
   * Animation with a slow start
   */
  easeIn: 'easeIn' as const,
  /**
   * Animation with a slow end
   */
  easeOut: 'easeOut' as const,
  /**
   * Animation with a slow start and end
   */
  easeInOut: 'easeInOut' as const,
});
/** @internal */
export type TimeFunction = $Values<typeof TimeFunction>;

/**
 * Unit normalized time. Value ranges between 0 and 1.
 * @internal */
export type UnitTime = number;

/** @internal */
export type TimingFunction = (time: UnitTime) => number;

/** @internal */
export interface TimingFunctionValues {
  y0?: number;
  y1?: number;
  t0?: number;
  t1?: number;
}

/**
 * Time functions used by CSS spec
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function
 * @internal
 */
export const TimingFunctions: Record<TimeFunction, TimingFunction> = {
  linear(t) {
    return t;
  },
  ease: bezier(0.25, 0.1, 0.25, 1.0),
  easeIn: bezier(0.42, 0.0, 1.0, 1.0),
  easeOut: bezier(0.0, 0.0, 0.58, 1.0),
  easeInOut: bezier(0.42, 0.0, 0.58, 1.0),
};
