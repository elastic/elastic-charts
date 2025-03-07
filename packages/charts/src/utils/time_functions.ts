/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import bezier from 'bezier-easing';
import type { $Values } from 'utility-types';

/** @public */
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
/** @public */
export type TimeFunction = $Values<typeof TimeFunction>;

/**
 * Unit normalized time. Value ranges between 0 and 1.
 * @internal */
export type UnitTime = number;

/** @internal */
export interface TimingFunction {
  (time: UnitTime): number;

  /**
   * Inverts timing function, takes a value from 0 to 1 and returns unit time
   */
  inverse: (value: number) => UnitTime;
}

/** @internal */
export interface TimingFunctionValues {
  y0?: number;
  y1?: number;
  t0?: number;
  t1?: number;
}

const getBezierFn = (x1: number, y1: number, x2: number, y2: number): TimingFunction => {
  const fn: TimingFunction = bezier(x1, y1, x2, y2) as TimingFunction;
  fn.inverse = bezier(y1, x1, y2, x2);
  return fn;
};

const linear: TimingFunction = ((t) => t) as TimingFunction;
linear.inverse = (n) => n;

/**
 * Time functions used by CSS spec
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function
 * @internal
 */
export const TimingFunctions: Record<TimeFunction, TimingFunction> = {
  linear,
  ease: getBezierFn(0.25, 0.1, 0.25, 1.0),
  easeIn: getBezierFn(0.42, 0.0, 1.0, 1.0),
  easeOut: getBezierFn(0.0, 0.0, 0.58, 1.0),
  easeInOut: getBezierFn(0.42, 0.0, 0.58, 1.0),
};
