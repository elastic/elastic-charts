/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BarRow, renderBarGlyph } from './glyphs/bar';
import { BoxplotRow, renderBoxplotGlyph } from './glyphs/boxplot';
import { Interval, TimeFormatter, AxisLayer } from '../../../xy_chart/axes/timeslip/continuous_time_rasters';
import { NumericScale } from '../../projections/scale';
import { TimeslipConfig } from '../config';
import { TimeslipDataRows } from '../data_fetch';

const textOffset = 0.35; // customary value
const showMissingValuesAsZero = false;

/** @internal */
export type Layers = AxisLayer<Interval>[];

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
  binStartList: Iterable<Interval>,
) => {
  for (const { minimum, labelSupremum } of binStartList) {
    const text =
      textNestLevelRowLimited === config.maxLabelRowCount
        ? labelFormat(minimum * 1000)
        : minorLabelFormat(minimum * 1000);
    if (text.length === 0) continue;
    const pixelX = Math.max(0, getPixelX(minimum));
    const textX = pixelX + config.horizontalPixelOffset;
    const y = config.verticalPixelOffset + (textNestLevelRowLimited - 1) * config.rowPixelPitch;
    // the measured text width, plus the `config.horizontalPixelOffset` on the left side must fit inside `maxWidth`
    const maxWidth = getPixelX(labelSupremum) - config.horizontalPixelOffset;
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
export const renderColumnBars = (
  ctx: CanvasRenderingContext2D,
  getPixelX: NumericScale,
  cartesianWidth: number,
  cartesianHeight: number,
  barPad: number,
  rows: TimeslipDataRows,
  yUnitScale: NumericScale,
  barChroma: TimeslipConfig['barChroma'],
  barFillAlpha: number,
  timeBins: Iterable<Interval>,
) => {
  for (const { minimum, supremum } of timeBins) {
    const foundRow = rows.find((r) => minimum * 1000 <= r.epochMs && r.epochMs < supremum * 1000);
    if (!foundRow && !showMissingValuesAsZero) continue;

    const fullBarPixelX = getPixelX(minimum);
    const barMaxWidthPixels = getPixelX(supremum) - fullBarPixelX - 2 * barPad;
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
        yUnitScale,
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
