/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Rect } from '../../geoms/types';
import type { ClippedRanges } from '../../utils/geometry';
import type { Ctx2d } from '../painter';

/**
 * A drawing callback over any Canvas2D-like context (a real context or a `Painter`).
 * @internal
 */
export type CanvasRenderer<R = void, C extends Ctx2d = Ctx2d> = (ctx: C) => R;

/** @internal */
export function withContext<C extends Ctx2d, R = void>(ctx: C, fun: (ctx: C) => R): R {
  ctx.save();
  const r = fun(ctx);
  ctx.restore();
  return r;
}

/**
 * order of rendering is important; determined by the order of layers in the array
 * @internal
 */
export function renderLayers<C extends Ctx2d>(ctx: C, layers: Array<(ctx: C) => void>) {
  layers.forEach((renderLayer) => renderLayer(ctx));
}

/** @internal */
export function withClip<C extends Ctx2d>(ctx: C, clippings: Rect, fun: (ctx: C) => void, shouldClip = true) {
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

/** @internal */
export function withClipRanges<C extends Ctx2d>(
  ctx: C,
  clippedRanges: ClippedRanges,
  { width, height, y }: Rect,
  negate: boolean,
  fun: (ctx: C) => void,
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
