/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBtoString } from '../../../../../common/color_library_wrappers';
import { Rect, Fill, Stroke } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { degToRad } from '../../../../../utils/common';

/** @internal */
export function renderRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  fill?: Fill,
  stroke?: Stroke,
  disableBoardOffset: boolean = false,
) {
  if (fill) {
    const borderOffset = !disableBoardOffset && stroke && stroke.width > 0.001 ? stroke.width : 0;
    const x = rect.x + borderOffset;
    const y = rect.y + borderOffset;
    const width = rect.width - borderOffset * 2;
    const height = rect.height - borderOffset * 2;

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = RGBtoString(fill.color);
    ctx.fill();

    if (fill.texture) {
      const { texture } = fill;
      withContext(ctx, (ctx) => {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        const rotation = degToRad(texture.rotation ?? 0);
        const { offset } = texture;

        if (offset && offset.global) ctx.translate(offset?.x ?? 0, offset?.y ?? 0);
        if (rotation) ctx.rotate(rotation);
        if (offset && !offset.global) ctx.translate(offset?.x ?? 0, offset?.y ?? 0);

        ctx.fillStyle = texture.pattern;

        // Use oversized rect to fill rotation/offset beyond path
        const rotationRectFillSize = ctx.canvas.clientWidth * ctx.canvas.clientHeight;
        ctx.translate(-rotationRectFillSize / 2, -rotationRectFillSize / 2);
        ctx.fillRect(0, 0, rotationRectFillSize, rotationRectFillSize);
      });
    }
  }

  if (stroke && stroke.width > 0.001) {
    const borderOffset = !disableBoardOffset && stroke && stroke.width > 0.001 ? stroke.width / 2 : 0;
    const x = rect.x + borderOffset;
    const y = rect.y + borderOffset;
    const width = rect.width - borderOffset * 2;
    const height = rect.height - borderOffset * 2;

    ctx.strokeStyle = RGBtoString(stroke.color);
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    if (stroke.dash) {
      ctx.setLineDash(stroke.dash);
    } else {
      // Setting linecap with dash causes solid line
      ctx.lineCap = 'square';
    }

    ctx.stroke();
  }
}
