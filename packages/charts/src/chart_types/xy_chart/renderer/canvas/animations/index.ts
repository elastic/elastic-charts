/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import moment from 'moment';
import { debounce } from 'ts-debounce';

import { Logger } from './../../../../../utils/logger';
import { Animation, AnimationOptions, AnimationState } from './animation';

/**
 * TODO add logic for other types like colors
 * @internal
 */
export type AnimatedValue = number;

/**
 * Function used to animate values from within a render context.
 *
 * `options` are applied only on initial render and never changed.
 * @internal
 */
export type AnimateFn = (options?: AnimationOptions) => <T extends AnimatedValue>(prop: string, value: T) => T;

/** @internal */
export interface AnimationContext {
  getValue: AnimateFn;
}

/** @internal */
export const getAnimationPoolFn = (
  animationState: AnimationState,
  renderFn: (animationCtx: AnimationContext, t: number) => void,
) => {
  // TODO might not need to clear raf outside of debounce
  window.cancelAnimationFrame(animationState.rafId);
  animationState.pool.forEach((a) => a.clear());

  return debounce(function getAnimationPoolFnDebounce(
    animationState: AnimationState,
    renderFn: (animationCtx: AnimationContext, t: number) => void,
  ) {
    const uniquePropsForRun = new Set();
    let renderCount = 0;
    const getAnimatedValueFn = (t: number): AnimateFn => (options) => (prop, value) => {
      if (t === 0 && uniquePropsForRun.has(prop)) {
        Logger.error(`Using getAnimatedValueFn must have unique prop for every value.`);
      }

      uniquePropsForRun.add(prop);
      if (!animationState.pool.has(prop)) {
        animationState.pool.set(prop, new Animation(value, options));
        return value;
      }

      const animation = animationState.pool.get(prop)!;

      animation.next(value);

      return animation.getValue(t);
    };

    function getAnimationContext(t: number): AnimationContext {
      // TODO build out simplified functions for different usages
      return {
        getValue: getAnimatedValueFn(t),
      };
    }

    renderFn(getAnimationContext(0), renderCount);

    animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
      const anim = (t: number) => {
        const elapsed = moment.duration(t - epochStartTime).asMilliseconds();
        const hasActiveAmins = [...animationState.pool.values()].some((a) => a.isActive(elapsed));
        renderFn(getAnimationContext(elapsed), ++renderCount);
        if (hasActiveAmins && renderCount < 100) {
          animationState.rafId = window.requestAnimationFrame(anim);
        }
      };
      animationState.rafId = window.requestAnimationFrame(anim);
    });
  },
  200)(animationState, renderFn);
};
