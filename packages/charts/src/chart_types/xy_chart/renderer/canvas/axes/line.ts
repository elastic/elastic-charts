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
import { Position } from '../../../../../utils/common';

/** @internal */
export function renderAxisLine(
  ctx: CanvasRenderingContext2D,
  { axisSpec: { position }, size: { width, height }, axisStyle: { axisLine } }: AxisProps,
) {
  if (!axisLine.visible) return;
  ctx.beginPath();
  ctx.moveTo(position === Position.Left ? width : 0, position === Position.Top ? height : 0);
  ctx.lineTo(position === Position.Right ? 0 : width, position === Position.Bottom ? 0 : height);
  ctx.strokeStyle = axisLine.stroke;
  ctx.lineWidth = axisLine.strokeWidth;
  ctx.stroke();
}
