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

import { AxisProps } from '.';
import { stringToRGB } from '../../../../../common/color_library_wrappers';
import { Position } from '../../../../../utils/common';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { AxisTick } from '../../../utils/axis_utils';
import { renderMultiLine } from '../primitives/line';

/** @internal */
export function renderTick(
  ctx: CanvasRenderingContext2D,
  tick: AxisTick,
  { axisSpec: { position }, size: { width, height }, axisStyle: { tickLine } }: AxisProps,
) {
  const horizontal = isHorizontalAxis(position); // todo avoid checking it per tick in the future
  const axisGirth = horizontal ? height : width;
  const tickSize = tickLine.size;
  const tickPosition = tick.position;
  const isTopOrLeftAxis = position === Position.Top || position === Position.Left;
  const xy = horizontal
    ? {
        x1: tickPosition,
        y1: isTopOrLeftAxis ? axisGirth - tickSize : 0,
        x2: tickPosition,
        y2: isTopOrLeftAxis ? axisGirth : tickSize,
      }
    : {
        x1: isTopOrLeftAxis ? axisGirth : 0,
        y1: tickPosition,
        x2: isTopOrLeftAxis ? axisGirth - tickSize : tickSize,
        y2: tickPosition,
      };
  renderMultiLine(ctx, [xy], { color: stringToRGB(tickLine.stroke), width: tickLine.strokeWidth });
}
