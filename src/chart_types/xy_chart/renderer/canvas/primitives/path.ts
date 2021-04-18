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

import { RGBtoString } from '../../../../../common/color_library_wrappers';
import { Rect, Stroke, Fill } from '../../../../../geoms/types';
import { withContext, withClipRanges } from '../../../../../renderers/canvas';
import { ClippedRanges } from '../../../../../utils/geometry';
import { Point } from '../../../../../utils/point';
import { renderMultiLine } from './line';

// function drawCheckeredBackground(can: HTMLCanvasElement, nRow: number, nCol: number, fill: Fill) {
//   const ctx = can.getContext('2d');
//   if (ctx != null) {
//     let w = can.width;
//     let h = can.height;

//     nRow = nRow || 8; // default number of rows
//     nCol = nCol || 8; // default number of columns

//     w /= nCol; // width of a block
//     h /= nRow; // height of a block

//     for (let i = 0; i < nRow; ++i) {
//       for (let j = 0, col = nCol / 2; j < col; ++j) {
//         ctx.rect(2 * j * w + (i % 2 ? 0 : w), i * h, w, h);
//       }
//     }

//     ctx.fillStyle = RGBtoString(fill.color);
//     ctx.fill();
//   }
// }

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
  const imgCanvas = document.createElement('canvas');
  imgCanvas.width = 100;
  imgCanvas.height = 100;
  const imgCtx = imgCanvas.getContext('2d');
  const img = new Image();
  img.src = require('../images/pattern.svg');

  img.addEventListener('load', function () {
    if (imgCtx != null) {
      imgCtx.drawImage(img, 0, 0, 200, 200);
      if (clippedRanges.length > 0) {
        withClipRanges(ctx, clippedRanges, clippings, false, (ctx) => {
          ctx.translate(transform.x, transform.y);
          renderPathFill(ctx, imgCanvas, area, fill);
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
          renderPathFill(ctx, imgCanvas, area, { ...fill, color });
        });
        return;
      }
      withContext(ctx, (ctx) => {
        ctx.translate(transform.x, transform.y);
        renderPathFill(ctx, imgCanvas, area, fill);
      });
    }
  });
  // drawCheckeredBackground(imgCanvas, 10, 10, fill);
}

function renderPathFill(ctx: CanvasRenderingContext2D, imgCanvas: HTMLCanvasElement, path: string, fill: Fill) {
  const path2d = new Path2D(path);
  const pattern = ctx.createPattern(imgCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.beginPath();
    ctx.fill(path2d);
    return;
  }
  ctx.fillStyle = RGBtoString(fill.color);
  ctx.beginPath();
  ctx.fill(path2d);
}
