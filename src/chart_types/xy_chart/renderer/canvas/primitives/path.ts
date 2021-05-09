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
import { drawPattern } from '../../../../../utils/themes/textures';
import { TexturedStyles } from '../../../../../utils/themes/theme';
import { renderMultiLine } from './line';

// function drawPattern(type: string, can: HTMLCanvasElement, fill: Fill, size: number) {
//   const ctx = can.getContext('2d');

//   if (ctx !== null) {
//     if (type.indexOf('line') === 0) {
//       ctx.strokeStyle = 'black';
//       ctx.beginPath();
//       ctx.stroke(new Path2D(linePaths(type.slice(4), size)));
//       return;
//     }

//     switch (type) {
//       case 'circle':
//         ctx.strokeStyle = 'black';
//         ctx.beginPath();
//         ctx.arc(size / 2, size / 2, 5, 0, 2 * Math.PI);
//         ctx.stroke();
//         break;
//       case 'circleFill':
//         ctx.strokeStyle = 'black';
//         ctx.beginPath();
//         ctx.arc(size / 2, size / 2, 2, 0, 2 * Math.PI);
//         ctx.fill();
//         break;
//       default:
//         break;
//     }
//   }

//   // if (ctx != null) {
//   //   ctx.fillStyle = RGBtoString(fill.color);
//   //   ctx.fill();
//   // }
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
  imgCanvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  transform: Point,
  area: string,
  fill: Fill,
  clippedRanges: ClippedRanges,
  clippings: Rect,
  hideClippedRanges = false,
) {
  const textures: TexturedStyles = {
    type: 'square',
    stroke: 'black',
    rotation: 1.5,
    scale: 20,
  };
  const pattern = drawPattern(ctx, textures, imgCanvas);
  if (clippedRanges.length > 0) {
    withClipRanges(ctx, clippedRanges, clippings, false, (ctx) => {
      ctx.translate(transform.x, transform.y);
      renderPathFill(ctx, area, fill, pattern);
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
      renderPathFill(ctx, area, { ...fill, color }, pattern);
    });
    return;
  }
  withContext(ctx, (ctx) => {
    ctx.translate(transform.x, transform.y);
    renderPathFill(ctx, area, fill, pattern);
  });
  // drawPattern(imgCanvas, fill);
}

function renderPathFill(ctx: CanvasRenderingContext2D, path: string, fill: Fill, pattern: CanvasPattern | null) {
  const path2d = new Path2D(path);
  ctx.fillStyle = RGBtoString(fill.color);
  ctx.fill(path2d);
  if (pattern) {
    ctx.fillStyle = pattern;
  }
  ctx.beginPath();
  ctx.fill(path2d);
}
