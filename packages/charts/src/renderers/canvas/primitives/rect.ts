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
export interface StrokedSides {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}

/** @internal */
export function renderRect(
  ctx: CanvasRenderingContext2D,
  { x, y, width, height }: Rect,
  { color, texture }: Fill,
  stroke: Stroke,
  disableBorderOffset: boolean = false,
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
  ctx.rect(x + borderOffset, y + borderOffset, width - borderOffset * 2, height - borderOffset * 2);
  ctx.fillStyle = RGBATupleToString(color);
  ctx.fill();

  if (texture) {
    ctx.fillStyle = texture.pattern;
    ctx.fill();
  }
}

/** @internal */
export function renderRectStroke(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  stroke: Stroke,
  strokedSides: StrokedSides,
) {
  if (
    stroke.width < MIN_STROKE_WIDTH ||
    (!strokedSides.left && !strokedSides.right && !strokedSides.top && !strokedSides.bottom)
  ) {
    return;
  }
  const { x, y, width, height } = normalizeRect(rect);

  const borderOffsetLeft = strokedSides?.left ? stroke.width : 0;
  const borderOffsetRight = strokedSides?.right ? stroke.width : 0;
  const borderOffsetTop = strokedSides?.top ? stroke.width : 0;
  const borderOffsetBottom = strokedSides?.bottom ? stroke.width : 0;

  ctx.strokeStyle = RGBATupleToString(stroke.color);
  ctx.lineWidth = stroke.width;
  ctx.setLineDash(stroke.dash ?? []); // no dash if stroke.dash is undefined
  ctx.lineCap = stroke.dash?.length ? 'butt' : 'square';

  const x0 = x + borderOffsetLeft / 2;
  const x1 = x + width - borderOffsetRight / 2;
  const y0 = y + borderOffsetTop / 2;
  const y1 = y + height - borderOffsetBottom / 2;
  ctx.beginPath();

  if (strokedSides?.top) {
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y0);
  }
  if (strokedSides?.right) {
    ctx.moveTo(x1, y0);
    ctx.lineTo(x1, y1);
  }
  if (strokedSides?.bottom) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x0, y1);
  }
  if (strokedSides?.left) {
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
