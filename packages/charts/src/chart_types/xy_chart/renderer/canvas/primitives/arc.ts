/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Circle, Stroke, Fill, Arc } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { fillAndStroke } from './utils';

/** @internal */
export function renderCircle(ctx: CanvasRenderingContext2D, circle: Circle, fill?: Fill, stroke?: Stroke) {
  if (!fill && !stroke) {
    return;
  }
  renderArc(
    ctx,
    {
      ...circle,
      startAngle: 0,
      endAngle: Math.PI * 2,
    },
    fill,
    stroke,
  );
}

/** @internal */
export function renderArc(ctx: CanvasRenderingContext2D, arc: Arc, fill?: Fill, stroke?: Stroke) {
  if (!fill && !stroke) {
    return;
  }
  withContext(ctx, () => {
    const { x, y, radius, startAngle, endAngle } = arc;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, radius, startAngle, endAngle, false);
    fillAndStroke(ctx, fill, stroke);
  });
}
