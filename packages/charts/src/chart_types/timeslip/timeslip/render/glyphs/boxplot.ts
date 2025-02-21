/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NumericScale } from '../../../projections/scale';

const goldenRatio = 1.618; // todo move it into constants

/** @public */
export type BoxplotRow = { boxplot: { lower: number; q1: number; q2: number; q3: number; upper: number } };

/** @internal */
export function renderBoxplotGlyph(
  ctx: CanvasRenderingContext2D,
  barMaxWidthPixels: number,
  barX: number,
  leftShortfall: number,
  foundRow: BoxplotRow,
  maxBarHeight: number,
  yUnitScale: NumericScale,
  opacityMultiplier: number,
  r: number,
  g: number,
  b: number,
  maxOpacity: number,
) {
  const boxplotWidth = barMaxWidthPixels / goldenRatio; // - clamp(rightShortfall etc etc)
  const whiskerWidth = boxplotWidth / 2;
  const boxplotLeftX = barX + (barMaxWidthPixels - boxplotWidth) / 2 - leftShortfall;
  const boxplotCenterX = boxplotLeftX + boxplotWidth / 2;
  const { /*min, */ lower, q1, q2, q3, upper /*max */ } = foundRow.boxplot;
  const lowerY = maxBarHeight * yUnitScale(lower);
  const q1Y = maxBarHeight * yUnitScale(q1);
  const q2Y = maxBarHeight * yUnitScale(q2);
  const q3Y = maxBarHeight * yUnitScale(q3);
  const upperY = maxBarHeight * yUnitScale(upper);
  // boxplot rectangle body with border
  if (lowerY !== upperY && q1Y !== q2Y && q2Y !== q3Y) {
    const unitVisibility = opacityMultiplier ** 5;
    ctx.beginPath();
    ctx.rect(boxplotLeftX, -q3Y, boxplotWidth, q3Y - q1Y);
    ctx.fillStyle = `rgba(${r},${g},${b},${maxOpacity * unitVisibility})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${r},${g},${b},1)`;
    ctx.lineWidth = unitVisibility;
    //ctx.stroke()
    // boxplot whiskers
    ctx.fillStyle = `rgba(${r},${g},${b},1)`;
    ctx.fillRect(boxplotCenterX - whiskerWidth / 2, -upperY, whiskerWidth, unitVisibility); // upper horizontal
    ctx.fillRect(boxplotCenterX - boxplotWidth / 2, -q3Y, boxplotWidth, unitVisibility); // q2 horizontal
    ctx.fillRect(boxplotCenterX - boxplotWidth / 2, -q2Y, boxplotWidth, unitVisibility); // q2 horizontal
    ctx.fillRect(boxplotCenterX - boxplotWidth / 2, -q1Y, boxplotWidth, unitVisibility); // q2 horizontal
    ctx.fillRect(boxplotCenterX - whiskerWidth / 2, -lowerY, whiskerWidth, unitVisibility); // lower horizontal
    ctx.fillRect(boxplotCenterX, -upperY, unitVisibility, upperY - q3Y); // top vertical
    ctx.fillRect(boxplotCenterX, -q1Y, unitVisibility, q1Y - lowerY); // bottom vertical
  }
}
