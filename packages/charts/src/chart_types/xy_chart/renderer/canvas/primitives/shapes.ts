/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBATupleToString } from '../../../../../common/color_library_wrappers';
import type { Circle, Fill, Stroke } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { MIN_STROKE_WIDTH } from '../../../../../renderers/canvas/primitives/line';
import { degToRad } from '../../../../../utils/common';
import type { PointShape } from '../../../../../utils/themes/theme';
import { ShapeRendererFn } from '../../shapes_paths';

/** @internal */
export function renderShape(
  ctx: CanvasRenderingContext2D,
  shape: PointShape,
  { x, y, radius }: Circle,
  { color: fillColor }: Fill,
  { width, dash, color: strokeColor }: Stroke,
) {
  withContext(ctx, () => {
    const [pathFn, rotation] = ShapeRendererFn[shape];
    ctx.translate(x, y);
    ctx.rotate(degToRad(rotation));
    ctx.beginPath();

    const path = new Path2D(pathFn(radius));

    ctx.fillStyle = RGBATupleToString(fillColor);
    ctx.fill(path);

    if (width > MIN_STROKE_WIDTH) {
      ctx.strokeStyle = RGBATupleToString(strokeColor);
      ctx.lineWidth = width;
      ctx.setLineDash(dash ?? []);
      ctx.stroke(path);
    }
  });
}
