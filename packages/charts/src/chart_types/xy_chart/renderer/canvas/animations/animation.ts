/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Keys } from 'utility-types';

import { TimeMs } from '../../../../../common/geometry';
import { isNil } from '../../../../../utils/common';
import { TimeFunction, TimingFunction, TimingFunctions } from './../../../../../utils/time_functions';

/**
 * TODO add logic for other types like colors
 * @public
 */
export type AnimatedValue = number;

/**
 * Shared animation speeds in ms
 * @internal
 */
export const AnimationSpeed = Object.freeze({
  extraFast: 90,
  fast: 150,
  normal: 250,
  slow: 350,
  extraSlow: 500,
});

/** @internal */
export type AnimationSpeed = $Keys<typeof AnimationSpeed>;

/** @internal */
export class Animation {
  private initial: AnimatedValue;
  private target: AnimatedValue;
  private current: AnimatedValue;
  private snapValues: AnimatedValue[];
  private timeFunction: TimeFunction;
  private delay: number; // ms
  private duration: number; // ms
  private timingFn: TimingFunction = () => NaN;

  constructor(initial: AnimatedValue, options: AnimationOptions = {}) {
    this.initial = initial;
    this.target = initial;
    this.current = initial;
    this.delay = typeof options?.delay === 'string' ? AnimationSpeed[options.delay] : options?.delay ?? 0;
    this.duration = typeof options?.duration === 'string' ? AnimationSpeed[options.duration] : options?.duration ?? 0;
    this.timeFunction = options?.timeFunction ?? TimeFunction.linear;
    this.snapValues = options?.snapValues ?? [];
  }

  isActive(t: number) {
    if (isNil(this.initial) || isNil(this.target) || this.initial === this.target) {
      return false;
    }

    return t - this.delay < this.duration;
  }

  next(value: AnimatedValue) {
    if (this.snapValues.includes(value)) {
      this.current = value;
      this.clear();
    } else if (this.target !== value) {
      this.initial = this.target;
      this.target = value;
      this.current = value;
      this.setTimingFn();
    }
  }

  setTimingFn() {
    const scalar = this.target - this.initial;
    this.timingFn = (t) => {
      const mulitplier = TimingFunctions[this.timeFunction](t);
      return this.initial + scalar * mulitplier;
    };
  }

  getValue(t: number): AnimatedValue {
    if (t < this.delay) return this.initial;
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
