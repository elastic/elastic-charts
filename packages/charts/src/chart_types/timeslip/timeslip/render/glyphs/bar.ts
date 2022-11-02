/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { NumericScale } from '../../../projections/scale';

/** @internal */
export type BarRow = { value: number };

/** @internal */
export function renderBarGlyph(
  ctx: CanvasRenderingContext2D,
  barWidthPixels: number,
  leftShortfall: number,
  maxBarHeight: number,
  yUnitScale: NumericScale,
  foundRow: BarRow,
  r: number,
  g: number,
  b: number,
  opacity: number,
  barX: number,
  opacityDependentLineThickness: number,
) {
  const renderedBarWidth = Math.max(0, barWidthPixels - leftShortfall);
  const barEnd = -maxBarHeight * yUnitScale(foundRow.value);
  const barStart = -maxBarHeight * yUnitScale(0);
  const barHeight = Math.abs(barStart - barEnd);
  const barY = Math.min(barStart, barEnd);
  ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
  ctx.fillRect(barX, barY, renderedBarWidth, barHeight);
  if (barEnd === barEnd) {
    ctx.fillStyle = `rgba(${r},${g},${b},1)`;
    ctx.fillRect(barX, barEnd, renderedBarWidth, opacityDependentLineThickness); // avoid Math.sqrt
  }
}
