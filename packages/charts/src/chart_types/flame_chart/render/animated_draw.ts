/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnimationState, ContinuousDomainFocus, GLResources } from '../types';
import { drawFrame } from './draw_a_frame';

const linear = (x: number) => x;
const easeInOut = (alpha: number) => (x: number) => x ** alpha / (x ** alpha + (1 - x) ** alpha);

/** @internal */
export function animatedDraw(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  containerWidth: number,
  containerHeight: number,
  animationDuration: number,
  focus: ContinuousDomainFocus,
  hoverIndex: number,
  animationState: AnimationState,
  glResources: GLResources,
  inTween: boolean,
) {
  const { gl, columnarGeomData, roundedRectRenderer, pickTextureRenderer, pickTexture } = glResources;
  if (!gl || !pickTexture) return;
  const { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1 } = focus;

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const timeFunction = animationDuration > 0 ? easeInOut(Math.min(5, animationDuration / 100)) : linear;

  const renderFrame = drawFrame(
    ctx,
    gl,
    focus,
    containerWidth,
    containerHeight,
    dpr,
    columnarGeomData,
    pickTexture,
    pickTextureRenderer,
    roundedRectRenderer,
    hoverIndex,
  );

  window.cancelAnimationFrame(animationState.rafId); // todo consider deallocating/reallocating or ensuring resources upon cancellation
  if (animationDuration > 0 && inTween) {
    renderFrame(0);
    const focusChanged = currentFocusX0 !== prevFocusX0 || currentFocusX1 !== prevFocusX1;
    if (focusChanged) {
      animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
        const anim = (t: number) => {
          const unitNormalizedTime = Math.max(0, (t - epochStartTime) / animationDuration);
          renderFrame(timeFunction(Math.min(1, unitNormalizedTime)));
          if (unitNormalizedTime <= 1) {
            animationState.rafId = window.requestAnimationFrame(anim);
          }
        };
        animationState.rafId = window.requestAnimationFrame(anim);
      });
    }
  } else {
    renderFrame(1);
  }
}
