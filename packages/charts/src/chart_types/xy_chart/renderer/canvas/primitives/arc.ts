/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Circle, Fill, Stroke } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { fillAndStroke } from './utils';

/** @internal */
export function renderCircle(ctx: CanvasRenderingContext2D, { x, y, radius }: Circle, fill?: Fill, stroke?: Stroke) {
  if (fill || stroke) {
    withContext(ctx, () => {
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);
      fillAndStroke(ctx, fill, stroke);
    });
  }
}
