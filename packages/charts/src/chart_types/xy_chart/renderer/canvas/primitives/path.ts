/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RGBtoString } from '../../../../../common/color_library_wrappers';
import { Fill, Rect, Stroke } from '../../../../../geoms/types';
import { withClipRanges, withContext } from '../../../../../renderers/canvas';
import { ClippedRanges } from '../../../../../utils/geometry';
import { Point } from '../../../../../utils/point';
import { renderMultiLine } from './line';

/** @internal */
export function renderLinePaths(
  ctx: CanvasRenderingContext2D,
  transform: Point,
  linePaths: Array<string>,
  stroke: Stroke,
  clippedRanges: ClippedRanges,
  clippings: Rect,
  hideClippedRanges = false,
) {
  if (clippedRanges.length > 0) {
    withClipRanges(ctx, clippedRanges, clippings, false, () => {
      ctx.translate(transform.x, transform.y);
      renderMultiLine(ctx, linePaths, stroke);
    });
    if (!hideClippedRanges) {
      withClipRanges(ctx, clippedRanges, clippings, true, () => {
        ctx.translate(transform.x, transform.y);
        renderMultiLine(ctx, linePaths, { ...stroke, dash: [5, 5] });
      });
    }
  } else {
    withContext(ctx, () => {
      ctx.translate(transform.x, transform.y);
      renderMultiLine(ctx, linePaths, stroke);
    });
  }
}

/** @internal */
export function renderAreaPath(
  ctx: CanvasRenderingContext2D,
  transform: Point,
  area: string,
  fill: Fill,
  clippedRanges: ClippedRanges,
  clippings: Rect,
  hideClippedRanges = false,
) {
  withClipRanges(ctx, clippedRanges, clippings, false, () => renderPathFill(ctx, area, fill, transform));
  if (clippedRanges.length > 0 && !hideClippedRanges) {
    withClipRanges(ctx, clippedRanges, clippings, true, () =>
      renderPathFill(ctx, area, { ...fill, color: { ...fill.color, opacity: fill.color.opacity / 2 } }, transform),
    );
  }
}

function renderPathFill(ctx: CanvasRenderingContext2D, path: string, fill: Fill, { x, y }: Point) {
  ctx.translate(x, y);
  const path2d = new Path2D(path);
  ctx.fillStyle = RGBtoString(fill.color);
  ctx.fill(path2d);

  if (fill.texture) {
    ctx.fillStyle = fill.texture.pattern;
    ctx.fill(path2d);
  }
}
