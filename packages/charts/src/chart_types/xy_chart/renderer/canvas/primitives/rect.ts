/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBtoString } from '../../../../../common/color_library_wrappers';
import { Fill, Rect, Stroke } from '../../../../../geoms/types';
import { MIN_STROKE_WIDTH } from './line';

/** @internal */
export function renderRect(
  ctx: CanvasRenderingContext2D,
  { x, y, width, height }: Rect,
  { color, texture }: Fill,
  stroke: Stroke,
  disableBorderOffset: boolean = false,
) {
  const borderWidth = !disableBorderOffset && stroke.width >= MIN_STROKE_WIDTH ? stroke.width : 0;
  if (stroke.width >= MIN_STROKE_WIDTH) {
    ctx.strokeStyle = RGBtoString(stroke.color);
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.rect(x + borderWidth / 2, y + borderWidth / 2, width - borderWidth, height - borderWidth);
    ctx.setLineDash(stroke.dash ?? []); // no dash if stroke.dash is undefined
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.rect(x + borderWidth, y + borderWidth, width - borderWidth * 2, height - borderWidth * 2);
  ctx.fillStyle = RGBtoString(color);
  ctx.fill();

  if (texture) {
    ctx.fillStyle = texture.pattern;
    ctx.fill();
  }
}
