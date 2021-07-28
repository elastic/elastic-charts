/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { AnimationState, ContinuousDomainFocus } from './partition';

const linear = (x: number) => x;
const easeInOut = (alpha: number) => (x: number) => x ** alpha / (x ** alpha + (1 - x) ** alpha);

const MAX_PADDING_RATIO = 0.25;

/** @internal */
export function renderWrappedPartitionCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  {
    config: { sectorLineWidth: padding, width: containerWidth, height: containerHeight, animation },
    quadViewModel,
    diskCenter,
    width: panelWidth,
    height: panelHeight,
  }: ShapeViewModel,
  { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1 }: ContinuousDomainFocus,
  animationState: AnimationState,
) {
  if (animation?.duration) {
    window.cancelAnimationFrame(animationState.rafId);
    render(0);
    const focusChanged = currentFocusX0 !== prevFocusX0 || currentFocusX1 !== prevFocusX1;
    if (focusChanged) {
      animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
        const anim = (t: number) => {
          const unitNormalizedTime = Math.max(0, Math.min(1, (t - epochStartTime) / animation.duration));
          render(unitNormalizedTime);
          if (unitNormalizedTime < 1) {
            animationState.rafId = window.requestAnimationFrame(anim);
          }
        };
        animationState.rafId = window.requestAnimationFrame(anim);
      });
    }
  } else {
    render(1);
  }

  function render(
    logicalTime: number,
    timeFunction: (time: number) => number = animation.duration
      ? easeInOut(Math.min(5, animation.duration / 100))
      : linear,
  ) {
    const width = containerWidth * panelWidth;
    const height = containerHeight * panelHeight;
    const t = timeFunction(logicalTime);
    const focusX0 = t * currentFocusX0 + (1 - t) * prevFocusX0 || 0;
    const focusX1 = t * currentFocusX1 + (1 - t) * prevFocusX1 || 0;
    const scale = containerWidth / (focusX1 - focusX0);
    const cornerRatio = 0.2;

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.scale(dpr, dpr);
    ctx.translate(diskCenter.x, diskCenter.y);
    ctx.clearRect(0, 0, width, height);

    quadViewModel.forEach(({ fillColor, x0, x1, y0px: y0, y1px: y1 }) => {
      if (y1 - y0 <= padding) return;

      const fx0 = Math.max((x0 - focusX0) * scale, 0);
      const fx1 = Math.min((x1 - focusX0) * scale, width);

      if (fx1 < 0 || fx0 > width) return;

      const fWidth = fx1 - fx0;
      const fPadding = Math.min(padding, MAX_PADDING_RATIO * fWidth);
      const paintedWidth = fWidth - fPadding;
      const paintedHeight = y1 - y0 - padding;
      const cornerRadius = 2 * cornerRatio * Math.min(paintedWidth, paintedHeight);
      const halfRadius = cornerRadius / 2;

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = cornerRadius;
      ctx.beginPath();
      ctx.rect(
        fx0 + fPadding + halfRadius,
        y0 + padding / 2 + halfRadius,
        paintedWidth - cornerRadius,
        paintedHeight - cornerRadius,
      );
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }
}
