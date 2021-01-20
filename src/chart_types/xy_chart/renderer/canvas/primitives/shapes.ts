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
import { Circle, Fill, Stroke } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { fillAndStroke } from './utils';

/** @internal */
export function renderCross(rotation = 45) {
  return (ctx: CanvasRenderingContext2D, shape: Circle, fill?: Fill, stroke?: Stroke) => {
    if (!stroke) {
      return;
    }
    withContext(ctx, (ctx) => {
      const { x, y, radius } = shape;
      ctx.lineCap = 'square';
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(-radius, 0);
      ctx.lineTo(radius, 0);
      ctx.moveTo(0, radius);
      ctx.lineTo(0, -radius);
      fillAndStroke(ctx, undefined, stroke);
    });
  };
}

/** @internal */
export function renderSquare(rotation = 0) {
  return (ctx: CanvasRenderingContext2D, shape: Circle, fill?: Fill, stroke?: Stroke) => {
    if (!stroke || !fill) {
      return;
    }
    withContext(ctx, (ctx) => {
      const { x, y, radius } = shape;

      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.rect(-radius, -radius, radius * 2, radius * 2);

      fillAndStroke(ctx, fill, stroke);
    });
  };
}

/** @internal */
export function renderTriangle(rotation = 0) {
  return (ctx: CanvasRenderingContext2D, shape: Circle, fill?: Fill, stroke?: Stroke) => {
    if (!stroke || !fill) {
      return;
    }

    withContext(ctx, (ctx) => {
      const { x, y, radius } = shape;

      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(-(radius * Math.sqrt(3)) / 2, radius / 2);
      ctx.lineTo((radius * Math.sqrt(3)) / 2, radius / 2);
      ctx.lineTo(0, -radius);
      ctx.closePath();
      fillAndStroke(ctx, fill, stroke);
    });
  };
}
