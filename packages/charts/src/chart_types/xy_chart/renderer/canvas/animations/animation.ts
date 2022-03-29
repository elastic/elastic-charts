/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isNil } from '../../../../../utils/common';
import { TimeFunction, TimingFunction, TimingFunctions } from './../../../../../utils/time_functions';

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
export class Animation {
  private initial: any;
  private target: any;
  private current: any;
  private snapValues: any[];
  private timeFunction: TimeFunction;
  private delay: number; // ms
  private duration: number; // ms
  private timingFn: TimingFunction = () => NaN;

  constructor(initial: any, options: AnimationOptions = {}) {
    this.initial = initial;
    this.target = initial;
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

  next(value: any) {
    if (this.snapValues.includes(value)) {
      this.current = value;
      this.clear();
    } else if (this.target !== value) {
      this.initial = this.target;
      this.target = value;
      this.current = value;
      this.timingFn = TimingFunctions[this.timeFunction]({
        t1: 1,
        y0: this.initial,
        y1: this.target,
      });
    }
  }

  getValue(t: number) {
    if (t < this.delay) return this.initial;
    const unitNormalizedTime = Math.max(0, Math.min(1, (t - this.delay) / this.duration));
    const value = this.timingFn(unitNormalizedTime);
    this.current = value; // need to set for clear to be called with no time value
    return value;
  }

  clear() {
    this.initial = this.current;
    this.target = this.current;
    this.timingFn = () => this.current;
  }
}

interface BaseAnimationOptions {
  /**
   * start delay in ms
   * @defaultValue 0
   */
  delay?: number | keyof typeof AnimationSpeed;
  /**
   * Snaps back to initial value instantly
   * @defaultValue false
   */
  snapValues?: any[];
}

/** @internal */
export interface TweenAnimationOptions extends BaseAnimationOptions {
  /**
   * The speed curve of the animation
   * @defaultValue 'linear'
   */
  timeFunction?: TimeFunction;
  /**
   * Duration from start of animation to completion in ms
   * @defaultValue 0
   */
  duration?: number | keyof typeof AnimationSpeed;
}

/** @internal */
export type AnimationOptions = TweenAnimationOptions;

/** @internal */
export interface AnimationState {
  rafId: number;
  pool: Map<string, Animation>;
}
