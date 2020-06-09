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

import { Circle, Stroke, Fill, Arc } from '../../../../../geoms/types';
import { withContext } from '../../../../../renderers/canvas';
import { RGBtoString } from '../../../../partition_chart/layout/utils/color_library_wrappers';
import { MIN_STROKE_WIDTH } from './line';

/** @internal */
export function renderCircle(ctx: CanvasRenderingContext2D, circle: Circle, fill?: Fill, stroke?: Stroke) {
  if (!fill && !stroke) {
    return;
  }
  renderArc(
    ctx,
    {
      ...circle,
      startAngle: 0,
      endAngle: Math.PI * 2,
    },
    fill,
    stroke,
  );
}

/** @internal */
export function renderArc(ctx: CanvasRenderingContext2D, arc: Arc, fill?: Fill, stroke?: Stroke) {
  if (!fill && !stroke) {
    return;
  }
  withContext(ctx, (ctx) => {
    const { x, y, radius, startAngle, endAngle } = arc;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, radius, startAngle, endAngle, false);
    if (fill) {
      ctx.fillStyle = RGBtoString(fill.color);
      ctx.fill();
    }
    if (stroke && stroke.width > MIN_STROKE_WIDTH) {
      ctx.strokeStyle = RGBtoString(stroke.color);
      ctx.lineWidth = stroke.width;
      if (stroke.dash) {
        ctx.setLineDash(stroke.dash);
      }
      ctx.stroke();
    }
  });
}
