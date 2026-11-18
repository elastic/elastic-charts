/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Ctx2d } from '../../../../../renderers/painter';

/** @internal */
export function renderChartTitle(ctx: Ctx2d, fontColor: string, chartWidth: number) {
  ctx.save();
  const titleFontSize = 32; // todo move to config
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.font = `normal normal 200 ${titleFontSize}px Inter, Helvetica, Arial, sans-serif`; // todo move to config
  ctx.fillStyle = fontColor;
  ctx.fillText('machine.ram', chartWidth / 2, titleFontSize * 0.5);
  ctx.fillText('KiB', chartWidth / 2, titleFontSize * 1.5);
  ctx.restore();
}
