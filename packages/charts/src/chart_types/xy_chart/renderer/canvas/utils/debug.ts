/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Fill, Stroke, Rect } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { degToRad } from '../../../../../utils/common';
import { Point } from '../../../../../utils/point';
import { renderRect } from '../primitives/rect';

const DEFAULT_DEBUG_FILL: Fill = {
  color: { r: 238, g: 130, b: 238, opacity: 0.2 },
};
const DEFAULT_DEBUG_STROKE: Stroke = {
  color: { r: 0, g: 0, b: 0, opacity: 0.2 },
  width: 1,
};

/** @internal */
export function renderDebugRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  rotation: number = 0,
  fill = DEFAULT_DEBUG_FILL, // violet
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
  fill = DEFAULT_DEBUG_FILL, // violet
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
