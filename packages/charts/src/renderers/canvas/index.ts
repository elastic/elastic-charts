/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rect } from '../../geoms/types';
import { ClippedRanges } from '../../utils/geometry';

/**
 * withContext abstracts out the otherwise error-prone save/restore pairing; it can be nested and/or put into sequence
 * The idea is that you just set what's needed for the enclosed snippet, which may temporarily override values in the
 * outer withContext. Example: we use a +y = top convention, so when doing text rendering, y has to be flipped (ctx.scale)
 * otherwise the text will render upside down.
 * @param ctx
 * @param fun
 * @internal
 */
export function withContext(ctx: CanvasRenderingContext2D, fun: (context: CanvasRenderingContext2D) => void) {
  ctx.save();
  fun(ctx);
  ctx.restore();
}

/** @internal */
export function clearCanvas(ctx: CanvasRenderingContext2D) {
  withContext(ctx, () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  });
}

// order of rendering is important; determined by the order of layers in the array
/** @internal */
export function renderLayers(ctx: CanvasRenderingContext2D, layers: Array<(ctx: CanvasRenderingContext2D) => void>) {
  layers.forEach((renderLayer) => renderLayer(ctx));
}

/** @internal */
export function withClip(
  ctx: CanvasRenderingContext2D,
  clippings: Rect,
  fun: (ctx: CanvasRenderingContext2D) => void,
  shouldClip = true,
) {
  withContext(ctx, () => {
    if (shouldClip) {
      const { x, y, width, height } = clippings;
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
    }
    withContext(ctx, () => {
      fun(ctx);
    });
  });
}

/**
 * Create clip from a set of clipped ranges
 * @internal
 */
export function withClipRanges(
  ctx: CanvasRenderingContext2D,
  clippedRanges: ClippedRanges,
  clippings: Rect,
  negate = false,
  fun: (ctx: CanvasRenderingContext2D) => void,
) {
  withContext(ctx, () => {
    const { length } = clippedRanges;
    const { width, height, y } = clippings;
    ctx.beginPath();
    if (negate) {
      clippedRanges.forEach(([x0, x1]) => {
        ctx.rect(x0, y, x1 - x0, height);
      });
    } else {
      if (length > 0) {
        ctx.rect(0, -0.5, clippedRanges[0][0], height);
        const lastX = clippedRanges[length - 1][1];
        ctx.rect(lastX, y, width - lastX, height);
      }

      if (length > 1) {
        for (let i = 1; i < length; i++) {
          const [, x0] = clippedRanges[i - 1];
          const [x1] = clippedRanges[i];
          ctx.rect(x0, y, x1 - x0, height);
        }
      }
    }
    ctx.clip();
    fun(ctx);
  });
}
