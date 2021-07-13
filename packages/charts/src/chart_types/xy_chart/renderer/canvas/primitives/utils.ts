/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBtoString } from '../../../../../common/color_library_wrappers';
import { Fill, Stroke } from '../../../../../geoms/types';
import { MIN_STROKE_WIDTH } from './line';

/**
 * WARNING: This function modify directly, without saving, the context calling the fill() and/or stroke() if defined
 * @internal
 */
export function fillAndStroke(ctx: CanvasRenderingContext2D, fill?: Fill, stroke?: Stroke, path?: Path2D) {
  if (fill) {
    ctx.fillStyle = RGBtoString(fill.color);
    if (path) {
      ctx.fill(path);
    } else {
      ctx.fill();
    }
  }
  if (stroke && stroke.width > MIN_STROKE_WIDTH) {
    ctx.strokeStyle = RGBtoString(stroke.color);
    ctx.lineWidth = stroke.width;
    if (stroke.dash) {
      ctx.setLineDash(stroke.dash);
    }
    if (path) {
      ctx.stroke(path);
    } else {
      ctx.stroke();
    }
  }
}
