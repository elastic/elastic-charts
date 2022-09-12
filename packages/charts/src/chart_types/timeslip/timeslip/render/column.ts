/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TimeFormatter, TimeBin, TimeRaster } from '../../../xy_chart/axes/timeslip/rasters';
import { NumericScale, TimeslipConfig, TimeslipDataRows } from '../timeslip_render';
import { BarRow, renderBarGlyph } from './glyphs/bar';
import { BoxplotRow, renderBoxplotGlyph } from './glyphs/boxplot';

const textOffset = 0.35; // customary value
const showMissingValuesAsZero = false;

/** @internal */
export type Layers = TimeRaster<TimeBin>[];

/** @internal */
export const renderColumnTickLabels = (
  ctx: CanvasRenderingContext2D,
  config: TimeslipConfig,
  fadeOutPixelWidth: number,
  emWidth: number,
  getPixelX: NumericScale,
  labelFormat: TimeFormatter,
  minorLabelFormat: TimeFormatter,
  textNestLevelRowLimited: number,
  cartesianWidth: number,
  binStartList: Iterable<TimeBin>,
) => {
  for (const { timePointSec, nextTimePointSec } of binStartList) {
    const text =
      textNestLevelRowLimited === config.maxLabelRowCount
        ? labelFormat(timePointSec * 1000)
        : minorLabelFormat(timePointSec * 1000);
    if (text.length <= 0) continue;
    const pixelX = Math.max(0, getPixelX(timePointSec));
    const textX = pixelX + config.horizontalPixelOffset;
    const y = config.verticalPixelOffset + (textNestLevelRowLimited - 1) * config.rowPixelPitch;
    const maxWidth = getPixelX(nextTimePointSec) - config.horizontalPixelOffset;
    const leftShortening =
      maxWidth >= cartesianWidth
        ? 0
        : Math.max(0, ctx.measureText(text).width + config.horizontalPixelOffset - maxWidth);
    const rightShortening =
      textX + Math.min(maxWidth, text.length * emWidth) < cartesianWidth
        ? 0
        : Math.max(0, textX + ctx.measureText(text).width - cartesianWidth);
    const maxWidthRight = Math.max(0, cartesianWidth - textX);
    const clipLeft = config.clipLeft && leftShortening > 0;
    const clipRight = config.clipRight && rightShortening > 0;
    if (clipLeft) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(config.horizontalPixelOffset, y - textOffset * config.rowPixelPitch, maxWidth, config.rowPixelPitch);
      ctx.clip();
    }
    if (clipRight) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(textX, y - textOffset * config.rowPixelPitch, maxWidthRight, config.rowPixelPitch);
      ctx.clip();
    }
    ctx.fillStyle = config.a11y.contrast === 'low' ? config.subduedFontColor : config.defaultFontColor;
    ctx.fillText(text, textX - leftShortening, y);
    if (clipRight) {
      const { r, g, b } = config.backgroundColor;
      const fadeOutRight = ctx.createLinearGradient(textX, 0, textX + maxWidthRight, 0);
      fadeOutRight.addColorStop(0, `rgba(${r},${g},${b},0)`);
      fadeOutRight.addColorStop(
        maxWidthRight <= 0 ? 0.5 : Math.max(0, 1 - fadeOutPixelWidth / maxWidthRight),
        `rgba(${r},${g},${b},0)`,
      );
      fadeOutRight.addColorStop(1, `rgba(${r},${g},${b},1)`);
      ctx.fillStyle = fadeOutRight;
      ctx.fill();
      ctx.restore();
    }
    if (clipLeft) {
      const { r, g, b } = config.backgroundColor;
      const fadeOutLeft = ctx.createLinearGradient(0, 0, maxWidth, 0);
      fadeOutLeft.addColorStop(0, `rgba(${r},${g},${b},1)`);
      fadeOutLeft.addColorStop(
        maxWidth <= 0 ? 0.5 : Math.min(1, fadeOutPixelWidth / maxWidth),
        `rgba(${r},${g},${b},0)`,
      );
      fadeOutLeft.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = fadeOutLeft;
      ctx.fill();
      ctx.restore();
    }
  }
};

/** @internal */
export const calcColumnBar = (
  getPixelX: NumericScale,
  unitBarMaxWidthPixelsSum: number,
  unitBarMaxWidthPixelsCount: number,
  i: number,
  halfLineThickness: number,
  implicit: boolean,
  { timePointSec, nextTimePointSec }: TimeBin,
) => {
  if (i !== 0) return { unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount };
  const barPad = implicit ? halfLineThickness : 0;
  const fullBarPixelX = getPixelX(timePointSec);
  const barMaxWidthPixels = getPixelX(nextTimePointSec) - fullBarPixelX - 2 * barPad;
  return {
    unitBarMaxWidthPixelsSum: unitBarMaxWidthPixelsSum + barMaxWidthPixels,
    unitBarMaxWidthPixelsCount: unitBarMaxWidthPixelsCount + 1,
  };
};

/** @internal */
export const renderColumnBars = (
  ctx: CanvasRenderingContext2D,
  getPixelX: NumericScale,
  cartesianWidth: number,
  cartesianHeight: number,
  barPad: number,
  rows: TimeslipDataRows,
  yUnitScale: NumericScale,
  yUnitScaleClamped: NumericScale,
  barChroma: TimeslipConfig['barChroma'],
  barFillAlpha: number,
  timeBins: Iterable<TimeBin>,
) => {
  for (const { timePointSec, nextTimePointSec } of timeBins) {
    const foundRow = rows.find((r) => timePointSec * 1000 <= r.epochMs && r.epochMs < nextTimePointSec * 1000);
    if (!foundRow && !showMissingValuesAsZero) continue;

    const fullBarPixelX = getPixelX(timePointSec);
    const barMaxWidthPixels = getPixelX(nextTimePointSec) - fullBarPixelX - 2 * barPad;
    const pixelX = Math.max(0, fullBarPixelX);

    // left side special case
    const leftShortfall = Math.abs(pixelX - fullBarPixelX);
    const leftOpacityMultiplier = leftShortfall ? 1 - Math.max(0, Math.min(1, leftShortfall / barMaxWidthPixels)) : 1;

    // right side special case
    const barX = pixelX + barPad;
    const rightShortfall = Math.max(0, barX + barMaxWidthPixels - cartesianWidth);

    const maxBarHeight = cartesianHeight;
    const barWidthPixels = barMaxWidthPixels - rightShortfall;

    const rightOpacityMultiplier = rightShortfall
      ? 1 - Math.max(0, Math.min(1, rightShortfall / barMaxWidthPixels))
      : 1;
    const { r, g, b } = barChroma;
    const maxOpacity = barFillAlpha;
    const opacityMultiplier = leftOpacityMultiplier * rightOpacityMultiplier;
    const opacity = maxOpacity * opacityMultiplier;
    const opacityDependentLineThickness = opacityMultiplier === 1 ? 1 : Math.sqrt(opacityMultiplier);
    ctx.save();
    if (foundRow?.boxplot) {
      renderBoxplotGlyph(
        ctx,
        barMaxWidthPixels,
        barX,
        leftShortfall,
        foundRow as BoxplotRow, // todo remove as
        maxBarHeight,
        yUnitScaleClamped,
        opacityMultiplier,
        r,
        g,
        b,
        maxOpacity,
      );
    } else {
      renderBarGlyph(
        ctx,
        barWidthPixels,
        leftShortfall,
        maxBarHeight,
        yUnitScale,
        foundRow as BarRow,
        yUnitScaleClamped,
        r,
        g,
        b,
        opacity,
        barX,
        opacityDependentLineThickness,
      );
    }
    ctx.restore();
  }
};

/** @internal */
export const renderVerticalGridLines = (
  ctx: CanvasRenderingContext2D,
  rowPixelPitch: number,
  cartesianHeight: number,
  fillStyle: string,
  lineThickness: number,
  halfLineThickness: number,
  lineNestLevelRowLimited: number,
  domainFrom: number,
  getPixelX: NumericScale,
  binStarts: Iterable<TimeBin>,
) => {
  for (const { timePointSec } of binStarts) {
    // the measured text width, plus the `config.horizontalPixelOffset` on the left side must fit inside `maxWidth`
    if (domainFrom >= timePointSec) continue;
    const pixelX = getPixelX(timePointSec);
    ctx.fillStyle = fillStyle;
    ctx.fillRect(
      pixelX - halfLineThickness,
      -cartesianHeight,
      lineThickness,
      cartesianHeight + lineNestLevelRowLimited * rowPixelPitch,
    );
  }
};
