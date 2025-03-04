/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisProps } from './axis_props';
import { Position as P } from '../../../../../utils/common';

/** @internal */
export function renderAxisLine(
  ctx: CanvasRenderingContext2D,
  { axisSpec: { position: p }, size: { width, height }, axisStyle: { axisLine } }: AxisProps,
) {
  if (!axisLine.visible) return;
  ctx.beginPath();
  ctx.moveTo(p === P.Left ? width : 0, p === P.Top ? height : 0);
  ctx.lineTo(p !== P.Right ? width : 0, p !== P.Bottom ? height : 0);
  ctx.strokeStyle = axisLine.stroke;
  ctx.lineWidth = axisLine.strokeWidth;
  ctx.stroke();
}
