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

import { TexturedStyles } from './theme';

function linePaths(type: string, s: number): string {
  switch (type) {
    case 'line':
      return `M ${s / 2}, 0 l 0, ${s}`;
    case 'square':
      return `M ${s / 4} ${s / 4} l ${s / 2} 0 l 0 ${s / 2} l ${-s / 2} 0 Z`;
    case 'triangle':
      return `M ${s / 2} 0 L ${s} ${s} L ${s} ${s / 2} Z`;
    case 'cross':
      return `M ${s / 4},${s / 4}l${s / 2},${s / 2}M${s / 4},${(s * 3) / 4}l${s / 2},${-s / 2}`;
    default:
      return `M ${s / 2}, 0 l 0, ${s}`;
  }
}

/** @public */
export function drawPattern(
  mainCtx: CanvasRenderingContext2D,
  textureStyle: TexturedStyles,
  canvas: HTMLCanvasElement,
) {
  const { type, stroke, opacity, scale, rotation, fill } = textureStyle;
  const size = scale || 10;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx !== null) {
    ctx.globalAlpha = opacity || 1;
    ctx.strokeStyle = stroke;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    switch (type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 5, 0, 2 * Math.PI);
        if (fill === 0) {
          ctx.stroke();
        } else {
          ctx.fill();
        }
        break;
      case 'triangle':
      case 'square':
        ctx.beginPath();
        if (fill === 0) {
          ctx.stroke(new Path2D(linePaths(type, size)));
        } else {
          ctx.fill(new Path2D(linePaths(type, size)));
        }
        break;
      case 'line':
      case 'cross':
        ctx.beginPath();
        ctx.stroke(new Path2D(linePaths(type, size)));
        break;
      default:
        break;
    }
    return mainCtx.createPattern(canvas, 'repeat');
  }
  return null;
}
