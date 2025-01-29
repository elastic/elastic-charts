/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBATupleToString } from '../../../../../common/color_library_wrappers';
import { Rect } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { renderRect } from '../../../../../renderers/canvas/primitives/rect';
import { DEFAULT_DEBUG_FILL, DEFAULT_DEBUG_STROKE } from '../../../../../renderers/canvas/utils/debug';
import { degToRad } from '../../../../../utils/common';
import { Point } from '../../../../../utils/point';

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
