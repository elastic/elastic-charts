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

/** @internal */
export function renderRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  { color, texture }: Fill,
  stroke: Stroke,
  disableBorderOffset: boolean = false,
) {
  const { x, y, width, height } = normalizeRect(rect);
  const borderOffset = !disableBorderOffset && stroke.width >= MIN_STROKE_WIDTH ? stroke.width : 0;
  const hasStroke = stroke.width >= MIN_STROKE_WIDTH && height >= borderOffset && width >= borderOffset;

  const sides = stroke.strokedSides ?? { top: true, right: true, bottom: true, left: true };

  const borderOffsetLeft = sides.left ? borderOffset : 0;
  const borderOffsetRight = sides.right ? borderOffset : 0;
  const borderOffsetTop = sides.top ? borderOffset : 0;
  const borderOffsetBottom = sides.bottom ? borderOffset : 0;

  // Fill the rectangle
  ctx.beginPath();
  ctx.rect(
    x + borderOffsetLeft,
    y + borderOffsetTop,
    width - borderOffsetLeft - borderOffsetRight,
    height - borderOffsetTop - borderOffsetBottom,
  );

  ctx.fillStyle = RGBATupleToString(color);
  ctx.fill();

  if (texture) {
    ctx.fillStyle = texture.pattern;
    ctx.fill();
  }

  // No stroke
  if (!hasStroke) return;

  // Stroke the rectangle
  ctx.strokeStyle = RGBATupleToString(stroke.color);
  ctx.lineWidth = stroke.width;
  ctx.setLineDash(stroke.dash ?? []); // no dash if stroke.dash is undefined
  ctx.lineCap = stroke.dash?.length ? 'butt' : 'square';

  const x0 = x + borderOffsetLeft / 2;
  const x1 = x + width - borderOffsetRight / 2;
  const y0 = y + borderOffsetTop / 2;
  const y1 = y + height - borderOffsetBottom / 2;
  ctx.beginPath();

  if (sides.top) {
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y0);
  }
  if (sides.right) {
    ctx.moveTo(x1, y0);
    ctx.lineTo(x1, y1);
  }
  if (sides.bottom) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x0, y1);
  }
  if (sides.left) {
    ctx.moveTo(x0, y1);
    ctx.lineTo(x0, y0);
  }
  ctx.stroke();
}

function normalizeRect(rect: Rect): Rect {
  let { x, y, width, height } = rect;
  if (width < 0) {
    x += width;
    width = -width;
  }
  if (height < 0) {
    y += height;
    height = -height;
  }
  return { x, y, width, height };
}
