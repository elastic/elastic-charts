/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Keys } from 'utility-types';

import { TimeMs } from '../../../../../common/geometry';
import { clamp, isFiniteNumber } from '../../../../../utils/common';
import { TimeFunction, TimingFunctions } from './../../../../../utils/time_functions';

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
  private previousTarget: AnimatedValue | null;
  private current: AnimatedValue;
  private snapValues: AnimatedValue[];
  private timeFunction: TimeFunction;
  private delay: TimeMs;
  private duration: TimeMs;
  private timeOffset: TimeMs;
  private timingFn: (n: number) => number = TimingFunctions.linear;

  constructor(value: AnimatedValue, options: AnimationOptions = {}) {
    this.initial = options?.initialValue ?? value;
    this.current = options?.initialValue ?? value;
    this.target = value;
    this.previousTarget = value;
    this.timeOffset = 0;
    this.delay = (typeof options?.delay === 'string' ? AnimationSpeed[options.delay] : options?.delay) ?? 0;
    this.duration =
      typeof options?.duration === 'string'
        ? AnimationSpeed[options.duration]
        : options?.duration ?? AnimationSpeed.slow;
    this.timeFunction = options?.timeFunction ?? TimeFunction.linear;
    this.snapValues = options?.snapValues ?? [];
    this.setTimingFn();
  }

  /**
   * Animation is delayed and value has not started tweening
   */
  isDelayed(t: TimeMs) {
    if (this.timeOffset !== 0) return false;
    return t < this.delay;
  }

  /**
   * Animation is delayed or actively tweening
   */
  isActive(t: TimeMs) {
    if (!isFiniteNumber(this.initial) || !isFiniteNumber(this.target) || this.initial === this.target) {
      return false;
    }

    return t - this.delay + this.timeOffset < this.duration;
  }

  /**
   * Sets the target value to trigger tweening of value
   */
  setTarget(value: AnimatedValue) {
    if (this.snapValues.includes(value)) {
      this.current = value;
      this.clear();
    } else if (this.target !== value) {
      if (this.previousTarget) {
        this.initial = this.previousTarget;
        this.target = value;
        this.setTimingFn();
        this.timeOffset = this.invertTimingFn();
      } else {
        this.timeOffset = 0;
        this.initial = this.current;
        this.target = value;
        this.setTimingFn();
      }
    }
  }

  private invertTimingFn() {
    const scaledValue = this.current - this.initial;
    const scalar = this.target - this.initial;
    const multiplier = scaledValue / scalar;
    const timeDelta = clamp(TimingFunctions[this.timeFunction].inverse(multiplier), 0, 1);
    return timeDelta * this.duration + this.delay;
  }

  private setTimingFn() {
    const scalar = this.target - this.initial;
    this.timingFn =
      scalar === 0
        ? () => this.initial
        : (t) => {
            const multiplier = TimingFunctions[this.timeFunction](t);
            return this.initial + scalar * multiplier;
          };
  }

  /**
   * Get animated value at time t
   */
  valueAtTime(t: TimeMs): AnimatedValue {
    if (this.isDelayed(t)) return this.initial;
    const unitNormalizedTime = Math.max(0, Math.min(1, (t - this.delay + this.timeOffset) / this.duration));
    const value = this.timingFn(unitNormalizedTime);
    this.current = value; // need to set for clear to be called with no time value
    return value;
  }

  /**
   * Pause animation at current time/value and clears initial and target values
   */
  clear() {
    this.previousTarget = this.current === this.target ? null : this.target;
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
   * By default, the initial value is determined on the initial render
   * then animates any change thereafter.
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
