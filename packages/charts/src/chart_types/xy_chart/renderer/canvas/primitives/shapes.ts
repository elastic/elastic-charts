/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Circle, Fill, Stroke } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { getRadians } from '../../../../../utils/common';
import { PointShape } from '../../../../../utils/themes/theme';
import { ShapeRendererFn } from '../../shapes_paths';
import { fillAndStroke } from './utils';

/** @internal */
export function renderShape(
  ctx: CanvasRenderingContext2D,
  shape: PointShape,
  coordinates: Circle,
  fill?: Fill,
  stroke?: Stroke,
) {
  if (!stroke || !fill) {
    return;
  }
  withContext(ctx, (ctx) => {
    const [pathFn, rotation] = ShapeRendererFn[shape];
    const { x, y, radius } = coordinates;
    ctx.translate(x, y);
    ctx.rotate(getRadians(rotation));
    ctx.beginPath();

    const path = new Path2D(pathFn(radius));
    fillAndStroke(ctx, fill, stroke, path);
  });
}
