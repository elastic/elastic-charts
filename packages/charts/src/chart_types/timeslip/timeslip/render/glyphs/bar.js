/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export function renderBarGlyph(
  ctx,
  barWidthPixels,
  leftShortfall,
  maxBarHeight,
  yUnitScale,
  foundRow,
  yUnitScaleClamped,
  r,
  g,
  b,
  opacity,
  barX,
  opacityDependentLineThickness,
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
