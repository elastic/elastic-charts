/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Rect, Stroke, Fill } from '../../../../../geoms/types';
import { withContext, withClipRanges } from '../../../../../renderers/canvas';
import { ClippedRanges } from '../../../../../utils/geometry';
import { Point } from '../../../../../utils/point';
import { RGBtoString } from '../../../../partition_chart/layout/utils/color_library_wrappers';
import { renderMultiLine } from './line';

/** @internal */
export function renderLinePaths(
  context: CanvasRenderingContext2D,
  transform: Point,
  linePaths: Array<string>,
  stroke: Stroke,
  clippedRanges: ClippedRanges,
  clippings: Rect,
  hideClippedRanges = false,
) {
  if (clippedRanges.length > 0) {
    withClipRanges(context, clippedRanges, clippings, false, (ctx) => {
      ctx.translate(transform.x, transform.y);
      renderMultiLine(ctx, linePaths, stroke);
    });
    if (hideClippedRanges) {
      return;
    }
    withClipRanges(context, clippedRanges, clippings, true, (ctx) => {
      ctx.translate(transform.x, transform.y);
      renderMultiLine(ctx, linePaths, { ...stroke, dash: [5, 5] });
    });
    return;
  }

  withContext(context, (ctx) => {
    ctx.translate(transform.x, transform.y);
    renderMultiLine(ctx, linePaths, stroke);
  });
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
  if (clippedRanges.length > 0) {
    withClipRanges(ctx, clippedRanges, clippings, false, (ctx) => {
      ctx.translate(transform.x, transform.y);
      renderPathFill(ctx, area, fill);
    });
    if (hideClippedRanges) {
      return;
    }
    withClipRanges(ctx, clippedRanges, clippings, true, (ctx) => {
      ctx.translate(transform.x, transform.y);
      const { opacity } = fill.color;
      const color = {
        ...fill.color,
        opacity: opacity / 2,
      };
      renderPathFill(ctx, area, { ...fill, color });
    });
    return;
  }
  withContext(ctx, (ctx) => {
    ctx.translate(transform.x, transform.y);
    renderPathFill(ctx, area, fill);
  });
}

function renderPathFill(ctx: CanvasRenderingContext2D, path: string, fill: Fill) {
  const path2d = new Path2D(path);
  ctx.fillStyle = RGBtoString(fill.color);
  ctx.beginPath();
  ctx.fill(path2d);
}
