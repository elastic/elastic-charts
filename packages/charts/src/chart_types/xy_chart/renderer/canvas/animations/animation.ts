/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isNil } from '../../../../../utils/common';

/** @internal */
export class Animation {
  private initial: any;
  private target: any;
  private current: any;
  private delay: number; // ms

  constructor(initial: any, options: AnimationOptions = {}) {
    this.initial = initial;
    this.target = initial;
    this.delay = typeof options?.delay === 'string' ? AnimationSpeed[options.delay] : options?.delay ?? 0;
  }

  isDelayed(t: number) {
    return t < this.delay;
  }

  isActive(t: number) {
    return this.isDelayed(t) && !isNil(this.initial) && !isNil(this.target) && this.initial !== this.target;
  }

  next(value: any) {
    if (this.target !== value) {
      this.initial = this.target;
      this.target = value;
    }
  }

  getValue(t: number) {
    // TODO interpolate value
    const value = t < this.delay ? this.initial : this.target;
    this.current = value; // need to set for clear to be called with no time value
    return value;
  }

  clear() {
    this.initial = this.current;
    this.target = this.current;
  }
}

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

interface BaseAnimationOptions {
  /**
   * start delay in ms
   * @defaultValue 0
   */
  delay?: number | keyof typeof AnimationSpeed;
}

/** @internal */
export interface TweenAnimationOptions extends BaseAnimationOptions {
  timeFunction?: 'linear';
}

/** @internal */
export type AnimationOptions = TweenAnimationOptions;

/** @internal */
export interface AnimationState {
  rafId: number;
  pool: Map<string, Animation>;
}
