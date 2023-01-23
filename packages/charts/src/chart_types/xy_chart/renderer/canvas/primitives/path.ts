/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderMultiLine } from './line';
import { RGBATupleToString } from '../../../../../common/color_library_wrappers';
import { Fill, Rect, Stroke } from '../../../../../geoms/types';
import { withClipRanges } from '../../../../../renderers/canvas';
import { ClippedRanges } from '../../../../../utils/geometry';
import { Point } from '../../../../../utils/point';

/** @internal */
export function renderLinePaths(
  ctx: CanvasRenderingContext2D,
  transform: Point,
  linePaths: Array<string>,
  stroke: Stroke,
  fitStroke: Stroke,
  clippedRanges: ClippedRanges,
  clippings: Rect,
  shouldClip: boolean,
) {
  withClipRanges(ctx, clippedRanges, clippings, false, () => {
    ctx.translate(transform.x, transform.y);
    renderMultiLine(ctx, linePaths, stroke);
  });
  if (clippedRanges.length > 0 && shouldClip) {
    withClipRanges(ctx, clippedRanges, clippings, true, () => {
      ctx.translate(transform.x, transform.y);
      renderMultiLine(ctx, linePaths, fitStroke);
    });
  }
}

/** @internal */
export function renderAreaPath(
  ctx: CanvasRenderingContext2D,
  transform: Point,
  area: string,
  fill: Fill,
  fitFill: Fill,
  clippedRanges: ClippedRanges,
  clippings: Rect,
  shouldClip: boolean,
) {
  withClipRanges(ctx, clippedRanges, clippings, false, () => renderPathFill(ctx, area, fill, transform));
  if (clippedRanges.length > 0 && shouldClip) {
    withClipRanges(ctx, clippedRanges, clippings, true, () => renderPathFill(ctx, area, fitFill, transform));
  }
}

function renderPathFill(ctx: CanvasRenderingContext2D, path: string, fill: Fill, { x, y }: Point) {
  ctx.translate(x, y);
  const path2d = new Path2D(path);
  ctx.fillStyle = RGBATupleToString(fill.color);
  ctx.fill(path2d);

  if (fill.texture) {
    ctx.fillStyle = fill.texture.pattern;
    ctx.fill(path2d);
  }
}
