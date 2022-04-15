/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { debounce } from 'ts-debounce';

import { Logger } from './../../../../../utils/logger';
import { AnimatedValue, Animation, AnimationOptions, AnimationState } from './animation';

const DISABLE_ANIMATIONS = Boolean(process.env.VRT);

/**
 * Function used to animate values from within a render context.
 *
 * `options` are applied only on initial render and never changed.
 * @internal
 */
export type AnimateFn = (options?: AnimationOptions) => (prop: string, value: AnimatedValue) => AnimatedValue;

/** @internal */
export interface AnimationContext {
  getValue: AnimateFn;
}

/** @internal */
export const getAnimationPoolFn = (
  animationState: AnimationState,
  renderFn: (animationCtx: AnimationContext) => void,
) => {
  // Must clear raf/pool outside of debounce to maintain active state
  window.cancelAnimationFrame(animationState.rafId);
  animationState.pool.forEach((a) => a.clear());

  return debounce(
    function getAnimationPoolFnDebounce() {
      const propValuesForRun = new Map<string, number>();
      const getAnimatedValueFn = (t: number): AnimateFn => (options) => (prop, value) => {
        if (t === 0 && propValuesForRun.has(prop) && propValuesForRun.get(prop) !== value) {
          Logger.error(
            `aCtx.getValue(\`${prop}\`, <value>) was called multiple times in a single render with different values.\
 Please animate these values independently to avoid collisions.`,
          );
        }

        if (DISABLE_ANIMATIONS || !(options?.enabled ?? true)) return value;

        propValuesForRun.set(prop, value);
        if (!animationState.pool.has(prop)) {
          animationState.pool.set(prop, new Animation(value, options));
        }

        const animation = animationState.pool.get(prop);
        if (!animation) return value;

        animation.setTarget(value);

        return animation.valueAtTime(t);
      };

      function getAnimationContext(t: number): AnimationContext {
        // TODO build out simplified functions for different usages
        return {
          getValue: getAnimatedValueFn(t),
        };
      }

      renderFn(getAnimationContext(0));

      animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
        const anim = (t: number) => {
          const elapsed = t - epochStartTime;
          const animations = [...animationState.pool.values()];

          // skips render if all animations are actively delayed
          if (!animations.every((a) => a.isDelayed(elapsed))) {
            renderFn(getAnimationContext(elapsed));
          }
          if (animations.some((a) => a.isActive(elapsed))) {
            animationState.rafId = window.requestAnimationFrame(anim);
          }
        };
        animationState.rafId = window.requestAnimationFrame(anim);
      });
    },
    300,
    { isImmediate: true }, // ensures the hovered ids are correct
  )();
};
