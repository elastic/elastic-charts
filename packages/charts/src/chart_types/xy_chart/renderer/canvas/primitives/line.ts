/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBATupleToString } from '../../../../../common/color_library_wrappers';
import { Line, Stroke } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';

/**
 * Canvas2d stroke ignores an exact zero line width
 * Any value that's equal to or larger than MIN_STROKE_WIDTH
 * @internal
 */
export const MIN_STROKE_WIDTH = 0.001;

/** @internal */
export function renderMultiLine(ctx: CanvasRenderingContext2D, lines: Line[] | string[], stroke: Stroke) {
  if (stroke.width < MIN_STROKE_WIDTH || lines.length === 0) {
    return;
  }
  withContext(ctx, () => {
    ctx.strokeStyle = RGBATupleToString(stroke.color);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'square';
    ctx.lineWidth = stroke.width;
    if (stroke.dash) {
      ctx.setLineDash(stroke.dash);
    }

    ctx.beginPath();

    for (const line of lines) {
      if (typeof line === 'string') {
        ctx.stroke(new Path2D(line));
      } else {
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
      }
    }
    ctx.stroke();
  });
}
