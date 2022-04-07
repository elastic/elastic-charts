/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Keys } from 'utility-types';

import { TimeMs } from '../../../../../common/geometry';
import { isFiniteNumber } from '../../../../../utils/common';
import { TimeFunction, TimingFunction, TimingFunctions } from './../../../../../utils/time_functions';

/**
 * TODO add logic for other types like colors
 * @public
 */
export type AnimatedValue = number;

/**
 * Shared animation speeds in ms
 * @public
 */
export const AnimationSpeed = Object.freeze({
  extraFast: 90,
  fast: 150,
  normal: 250,
  slow: 350,
  extraSlow: 500,
});

/** @public */
export type AnimationSpeed = $Keys<typeof AnimationSpeed>;

/** @internal */
export class Animation {
  private initial: AnimatedValue;
  private target: AnimatedValue;
  private current: AnimatedValue;
  private snapValues: AnimatedValue[];
  private timeFunction: TimeFunction;
  private delay: TimeMs;
  private duration: TimeMs;
  private timingFn: TimingFunction = () => NaN;

  constructor(value: AnimatedValue, options: AnimationOptions = {}) {
    this.initial = options?.initialValue ?? value;
    this.current = options?.initialValue ?? value;
    this.target = value;
    this.delay = (typeof options?.delay === 'string' ? AnimationSpeed[options.delay] : options?.delay) ?? 0;
    this.duration =
      typeof options?.duration === 'string'
        ? AnimationSpeed[options.duration]
        : options?.duration ?? AnimationSpeed.slow;
    this.timeFunction = options?.timeFunction ?? TimeFunction.linear;
    this.snapValues = options?.snapValues ?? [];

    if (options.hasOwnProperty('initialValue')) {
      this.setTimingFn();
    }
  }

  isDelayed(t: TimeMs) {
    return t < this.delay;
  }

  isActive(t: TimeMs) {
    if (!isFiniteNumber(this.initial) || !isFiniteNumber(this.initial) || this.initial === this.target) {
      return false;
    }

    return t - this.delay < this.duration;
  }

  next(value: AnimatedValue) {
    if (this.snapValues.includes(value)) {
      this.current = value;
      this.clear();
    } else if (this.target !== value) {
      this.initial = this.current;
      this.target = value;
      this.setTimingFn();
    }
  }

  private setTimingFn() {
    const scalar = this.target - this.initial;
    this.timingFn = (t) => {
      const mulitplier = TimingFunctions[this.timeFunction](t);
      return this.initial + scalar * mulitplier;
    };
  }

  getValue(t: TimeMs): AnimatedValue {
    if (this.isDelayed(t)) return this.initial;
    const unitNormalizedTime = Math.max(0, Math.min(1, (t - this.delay) / this.duration));
    const value = this.timingFn(unitNormalizedTime);
    this.current = value; // need to set for clear to be called with no time value
    return value;
  }

  clear() {
    this.initial = this.current;
    this.target = this.current;
    this.setTimingFn();
  }
}

/** @public */
export interface AnimationOptions {
  /**
   * Enables animations on annotations
   */
  enabled?: boolean;
  /**
   * Set initial value for initial render animations.
   * By default the initial value is determined on the initial render
   * then animtes any change thereafter.
   *
   * @example
   * ```ts
   * // Initially animates the height from 0 to 100 with no value change
   * atx.getValue('bar-height', 100, { initialValue: 0 })
   * ```
   */
  initialValue?: AnimatedValue;
  /**
   * start delay in ms
   */
  delay?: TimeMs | AnimationSpeed;
  /**
   * Snaps back to initial value instantly
   */
  snapValues?: AnimatedValue[];
  /**
   * The speed curve of the animation
   */
  timeFunction?: TimeFunction;
  /**
   * Duration from start of animation to completion in ms
   */
  duration?: TimeMs | AnimationSpeed;
}

/** @internal */
export interface AnimationState {
  rafId: number;
  pool: Map<string, Animation>;
}
