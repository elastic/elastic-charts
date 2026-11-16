/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Ctx2d } from '../../../../../renderers/painter';

/** @internal */
export function renderDebugBox(ctx: Ctx2d, cartesianWidth: number, cartesianHeight: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, cartesianWidth, cartesianHeight);
  ctx.strokeStyle = 'magenta';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}
