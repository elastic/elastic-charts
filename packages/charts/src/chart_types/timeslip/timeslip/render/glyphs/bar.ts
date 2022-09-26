/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { NumericScale } from '../../timeslip_render';

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
  yUnitScaleClamped: NumericScale,
  r: number,
  g: number,
  b: number,
  opacity: number,
  barX: number,
  opacityDependentLineThickness: number,
) {
  const renderedBarWidth = Math.max(0, barWidthPixels - leftShortfall);
  const barEnd = -maxBarHeight * yUnitScale(foundRow.value);
  const clampedBarEnd = -maxBarHeight * yUnitScaleClamped(foundRow.value);
  const clampedBarStart = -maxBarHeight * yUnitScaleClamped(0);
  const barHeight = Math.abs(clampedBarStart - clampedBarEnd);
  const barY = Math.min(clampedBarStart, clampedBarEnd);
  ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
  ctx.fillRect(barX, barY, renderedBarWidth, barHeight);
  if (clampedBarEnd === barEnd) {
    ctx.fillStyle = `rgba(${r},${g},${b},1)`;
    ctx.fillRect(barX, clampedBarEnd, renderedBarWidth, opacityDependentLineThickness); // avoid Math.sqrt
  }
}
