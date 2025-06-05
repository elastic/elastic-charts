/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MIN_STROKE_WIDTH } from './line';
import { RGBATupleToString } from '../../../common/color_library_wrappers';
import type { Fill, Rect, Stroke } from '../../../geoms/types';
import { isFiniteNumber } from '../../../utils/common';

/** @internal */
export function renderRect(
  ctx: CanvasRenderingContext2D,
  { x, y, width, height }: Rect,
  { color, texture }: Fill,
  stroke: Stroke,
  disableBorderOffset: boolean = false,
  rounded?: number,
) {
  const borderOffset = !disableBorderOffset && stroke.width >= MIN_STROKE_WIDTH ? stroke.width : 0;
  if (stroke.width >= MIN_STROKE_WIDTH && height >= borderOffset && width >= borderOffset) {
    ctx.strokeStyle = RGBATupleToString(stroke.color);
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.rect(x + borderOffset / 2, y + borderOffset / 2, width - borderOffset, height - borderOffset);
    ctx.setLineDash(stroke.dash ?? []); // no dash if stroke.dash is undefined
    ctx.lineCap = stroke.dash?.length ? 'butt' : 'square';
    ctx.stroke();
  }

  ctx.beginPath();
  if (isFiniteNumber(rounded) && rounded > 0) {
    ctx.roundRect(x + borderOffset, y + borderOffset, width - borderOffset * 2, height - borderOffset * 2, rounded);
  } else {
    ctx.rect(x + borderOffset, y + borderOffset, width - borderOffset * 2, height - borderOffset * 2);
  }
  ctx.fillStyle = RGBATupleToString(color);
  ctx.fill();

  if (texture) {
    ctx.fillStyle = texture.pattern;
    ctx.fill();
  }
}
