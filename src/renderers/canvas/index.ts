/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Coordinate } from '../../common/geometry';
import { Rect } from '../../geoms/types';
import { ClippedRanges } from '../../utils/geometry';
import { Point } from '../../utils/point';

/**
 * withContext abstracts out the otherwise error-prone save/restore pairing; it can be nested and/or put into sequence
 * The idea is that you just set what's needed for the enclosed snippet, which may temporarily override values in the
 * outer withContext. Example: we use a +y = top convention, so when doing text rendering, y has to be flipped (ctx.scale)
 * otherwise the text will render upside down.
 * @param ctx
 * @param fun
 * @internal
 */
export function withContext(ctx: CanvasRenderingContext2D, fun: (ctx: CanvasRenderingContext2D) => void) {
  ctx.save();
  fun(ctx);
  ctx.restore();
}

/** @internal */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: Coordinate, height: Coordinate) {
  withContext(ctx, (ctx) => {
    ctx.clearRect(-width, -height, 2 * width, 2 * height); // remove past contents
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
  withContext(ctx, (ctx) => {
    if (shouldClip) {
      const { x, y, width, height } = clippings;
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
    }
    withContext(ctx, (ctx) => {
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
  withContext(ctx, (context) => {
    const { length } = clippedRanges;
    const { width, height, y } = clippings;
    context.beginPath();
    if (negate) {
      clippedRanges.forEach(([x0, x1]) => {
        context.rect(x0, y, x1 - x0, height);
      });
    } else {
      if (length > 0) {
        context.rect(0, -0.5, clippedRanges[0][0], height);
        const lastX = clippedRanges[length - 1][1];
        context.rect(lastX, y, width - lastX, height);
      }

      if (length > 1) {
        for (let i = 1; i < length; i++) {
          const [, x0] = clippedRanges[i - 1];
          const [x1] = clippedRanges[i];
          context.rect(x0, y, x1 - x0, height);
        }
      }
    }
    context.clip();
    fun(context);
  });
}

/** @internal */
export function withRotatedOrigin(
  ctx: CanvasRenderingContext2D,
  origin: Point,
  rotation: number = 0,
  fn: (ctx: CanvasRenderingContext2D) => void,
) {
  withContext(ctx, (ctx) => {
    const { x, y } = origin;
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-x, -y);
    fn(ctx);
  });
}
