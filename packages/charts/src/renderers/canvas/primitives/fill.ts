/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBATupleToString } from '../../../common/color_library_wrappers';
import type { Fill, ResolvedLinearGradient } from '../../../geoms/types';
import type { Ctx2d, GradientHandle, Painter } from '../../painter';

/**
 * Bounding box of the shape being filled, in the current canvas coordinate space.
 * Used to map a gradient's normalized `[0, 1]` coordinates onto actual pixels.
 * @internal
 */
export interface FillBoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function buildCanvasGradient(
  ctx: Ctx2d,
  gradient: ResolvedLinearGradient,
  { x0, y0, x1, y1 }: FillBoundingBox,
): GradientHandle {
  const width = x1 - x0;
  const height = y1 - y0;
  const canvasGradient = ctx.createLinearGradient(
    x0 + gradient.x0 * width,
    y0 + gradient.y0 * height,
    x0 + gradient.x1 * width,
    y0 + gradient.y1 * height,
  );
  for (const { offset, color } of gradient.stops) {
    canvasGradient.addColorStop(offset, RGBATupleToString(color));
  }
  return canvasGradient;
}

/**
 * Paints with the fill's color or gradient, then once more with its texture when it has one.
 * @internal
 */
export function applyCanvasFill(ctx: Painter, fill: Fill, bbox: FillBoundingBox, paint: () => void) {
  ctx.fillStyle = fill.gradient ? buildCanvasGradient(ctx, fill.gradient, bbox) : RGBATupleToString(fill.color);
  paint();

  if (fill.texture) {
    const pattern = ctx.createPattern(fill.texture);
    if (pattern) {
      ctx.fillStyle = pattern;
      paint();
    }
  }
}
