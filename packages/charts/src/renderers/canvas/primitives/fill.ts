/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBATupleToString } from '../../../common/color_library_wrappers';
import type { Fill, Gradient } from '../../../geoms/types';

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
  ctx: CanvasRenderingContext2D,
  gradient: Gradient,
  { x0, y0, x1, y1 }: FillBoundingBox,
): CanvasGradient {
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

/** @internal */
export function applyCanvasFill(ctx: CanvasRenderingContext2D, fill: Fill, bbox: FillBoundingBox, paint: () => void) {
  ctx.fillStyle = fill.gradient ? buildCanvasGradient(ctx, fill.gradient, bbox) : RGBATupleToString(fill.color);
  paint();

  if (fill.texture) {
    ctx.fillStyle = fill.texture.pattern;
    paint();
  }
}
