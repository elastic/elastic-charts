/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../common/colors';
import { Rect } from '../../geoms/types';
import { ClippedRanges } from '../../utils/geometry';

/** @internal */
export type CanvasRenderer<R = void> = (ctx: CanvasRenderingContext2D) => R;

/**
 * withContext abstracts out the otherwise error-prone save/restore pairing; it can be nested and/or put into sequence
 * The idea is that you just set what's needed for the enclosed snippet, which may temporarily override values in the
 * outer withContext. Example: we use a +y = top convention, so when doing text rendering, y has to be flipped (ctx.scale)
 * otherwise the text will render upside down.
 * @param ctx
 * @param fun
 * @internal
 */
export function withContext<R = void>(ctx: CanvasRenderingContext2D, fun: CanvasRenderer<R>): R {
  ctx.save();
  const r = fun(ctx);
  ctx.restore();
  return r;
}

/** @internal */
export function clearCanvas(ctx: CanvasRenderingContext2D, bgColor: Color) {
  withContext(ctx, () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // with transparent background, clearRect is required
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = bgColor;
    // filling with the background color is required to have a precise text color contrast calculation
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  });
}

// order of rendering is important; determined by the order of layers in the array
/** @internal */
export function renderLayers(ctx: CanvasRenderingContext2D, layers: Array<CanvasRenderer>) {
  layers.forEach((renderLayer) => renderLayer(ctx));
}

/** @internal */
export function withClip(ctx: CanvasRenderingContext2D, clippings: Rect, fun: CanvasRenderer, shouldClip = true) {
  withContext(ctx, () => {
    if (shouldClip) {
      const { x, y, width, height } = clippings;
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
    }
    withContext(ctx, () => fun(ctx));
  });
}

/**
 * Create clip from a set of clipped ranges
 * @internal
 */
export function withClipRanges(
  ctx: CanvasRenderingContext2D,
  clippedRanges: ClippedRanges,
  { width, height, y }: Rect,
  negate: boolean,
  fun: CanvasRenderer,
) {
  withContext(ctx, () => {
    if (clippedRanges.length > 0) {
      ctx.beginPath();
      if (negate) {
        clippedRanges.forEach(([x0, x1]) => ctx.rect(x0, y, x1 - x0, height));
      } else {
        const firstX = clippedRanges[0]?.[0] ?? NaN;
        const lastX = clippedRanges.at(-1)?.[1] ?? NaN;
        ctx.rect(0, -0.5, firstX, height);
        ctx.rect(lastX, y, width - lastX, height);
        clippedRanges.forEach(([, x0], i) => {
          if (i < clippedRanges.length - 1) {
            ctx.rect(x0, y, (clippedRanges[i + 1]?.[0] ?? NaN) - x0, height);
          }
        });
      }
      ctx.clip();
    }
    fun(ctx);
  });
}
