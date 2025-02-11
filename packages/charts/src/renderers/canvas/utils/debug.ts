/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withContext } from '../';
import { overrideOpacity, RGBATupleToString } from '../../../common/color_library_wrappers';
import { Colors } from '../../../common/colors';
import { Fill, Stroke, Rect } from '../../../geoms/types';
import { renderRect } from '../../../renderers/canvas/primitives/rect';
import { degToRad } from '../../../utils/common';
import { Point } from '../../../utils/point';

/** @internal */
export const DEFAULT_DEBUG_FILL: Fill = {
  color: overrideOpacity(Colors.Violet.rgba, 0.2),
};

/** @internal */
export const DEFAULT_DEBUG_STROKE: Stroke = {
  color: [0, 0, 0, 0.2],
  width: 1,
};

/** @internal */
export function renderDebugRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  rotation = 0,
  fill = DEFAULT_DEBUG_FILL,
  stroke = DEFAULT_DEBUG_STROKE,
) {
  withContext(ctx, () => {
    ctx.translate(rect.x, rect.y);
    ctx.rotate(degToRad(rotation));
    renderRect(ctx, { ...rect, x: 0, y: 0 }, fill, stroke, true);
  });
}

/** @internal */
export function renderDebugRectCenterRotated(
  ctx: CanvasRenderingContext2D,
  center: Point,
  rect: Rect,
  fill = DEFAULT_DEBUG_FILL,
  stroke = DEFAULT_DEBUG_STROKE,
  rotation: number = 0,
) {
  const { x, y } = center;

  withContext(ctx, () => {
    ctx.translate(x, y);
    ctx.rotate(degToRad(rotation));
    ctx.translate(-x, -y);
    renderRect(ctx, { ...rect, x: x - rect.width / 2, y: y - rect.height / 2 }, fill, stroke);
  });
}

/** @internal */
export function renderDebugPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size = 16,
  stroke = DEFAULT_DEBUG_STROKE,
) {
  withContext(ctx, () => {
    ctx.beginPath();
    ctx.lineWidth = stroke.width;
    ctx.strokeStyle = RGBATupleToString(stroke.color);

    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);

    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);

    ctx.stroke();
  });
}
