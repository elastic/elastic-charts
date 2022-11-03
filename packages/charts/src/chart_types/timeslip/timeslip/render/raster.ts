/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { doing, executing, filtering, mapping, pipeline } from '../../../../common/iterables';
import {
  NumberFormatter,
  Interval,
  TimeFormatter,
  AxisLayer,
} from '../../../xy_chart/axes/timeslip/continuous_time_rasters';
import { MAX_TIME_GRID_COUNT, notTooDense } from '../../../xy_chart/axes/timeslip/multilayer_ticks';
import { NumericScale } from '../../projections/scale';
import { clamp } from '../../utils/math';
import { TimeslipConfig } from '../config';
import { DataState } from '../data_fetch';
import { Layers, renderColumnBars, renderColumnTickLabels } from './column';

const TIMESLIP_MAX_TIME_GRID_COUNT = 100 || MAX_TIME_GRID_COUNT; // use either

interface LoHi {
  lo: Interval | null;
  hi: Interval | null;
  unitBarMaxWidthPixelsSum: number;
  unitBarMaxWidthPixelsCount: number;
}

const renderHorizontalGridLines = (
  ctx: CanvasRenderingContext2D,
  config: TimeslipConfig,
  niceTicks: number[],
  yUnitScale: NumericScale,
  cartesianHeight: number,
  yTickNumberFormatter: NumberFormatter,
  cartesianWidth: number,
) => {
  ctx.save();
  const { r, g, b } = config.backgroundColor;
  const lineStyle = config.implicit
    ? `rgb(${r},${g},${b})`
    : `rgba(128,128,128,${config.a11y.contrast === 'low' ? 0.5 : 1})`;
  ctx.textBaseline = 'middle';
  ctx.font = config.cssFontShorthand;
  for (const gridDomainValueY of niceTicks) {
    const yUnit = yUnitScale(gridDomainValueY);
    if (yUnit !== clamp(yUnit, -0.01, 1.01)) {
      // todo set it back to 0 and 1 if recurrence relation of transitioning can reach 1 in finite time
      continue;
    }
    const y = -cartesianHeight * yUnit;
    const text = yTickNumberFormatter(gridDomainValueY);
    ctx.fillStyle = gridDomainValueY === 0 ? config.defaultFontColor : lineStyle;
    ctx.fillRect(
      -config.yTickOverhang,
      y,
      cartesianWidth + 2 * config.yTickOverhang,
      gridDomainValueY === 0 ? 0.5 : config.implicit ? 0.2 : 0.1,
    );
    ctx.fillStyle = config.subduedFontColor;
    ctx.textAlign = 'left';
    ctx.fillText(text, cartesianWidth + config.yTickOverhang + config.yTickGap, y);
    ctx.textAlign = 'right';
    ctx.fillText(text, -config.yTickOverhang - config.yTickGap, y);
  }
  ctx.restore();
};

const binsToRender = (binStarts: Iterable<Interval>, domainFrom: number, domainTo: number) => {
  const binStartList: Interval[] = [];
  for (const binStart of binStarts) {
    if (binStart.minimum > domainTo) break;
    if (binStart.minimum < domainFrom) {
      binStartList[0] = binStart;
    } else {
      binStartList.push(binStart);
    }
  }
  return binStartList;
};

/** @internal */
export const calcColumnBar = (
  getPixelX: NumericScale,
  unitBarMaxWidthPixelsSum: number,
  unitBarMaxWidthPixelsCount: number,
  i: number,
  halfLineThickness: number,
  implicit: boolean,
  { minimum, supremum }: Interval,
) => {
  if (i !== 0) return { unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount };
  const barPad = implicit ? halfLineThickness : 0;
  const fullBarPixelX = getPixelX(minimum);
  const barMaxWidthPixels = getPixelX(supremum) - fullBarPixelX - 2 * barPad;
  return {
    unitBarMaxWidthPixelsSum: unitBarMaxWidthPixelsSum + barMaxWidthPixels,
    unitBarMaxWidthPixelsCount: unitBarMaxWidthPixelsCount + 1,
  };
};

const updateLoHi = (
  binStarts: Iterable<Interval>,
  implicit: boolean,
  halfLineThickness: number,
  getPixelX: NumericScale,
  loHi: LoHi,
  i: number,
) => {
  for (const binStart of binStarts) {
    if (i === 0) {
      loHi.lo = loHi.lo || binStart;
      loHi.hi = binStart;
    }

    // update loHi
    const { unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount } = calcColumnBar(
      getPixelX,
      loHi.unitBarMaxWidthPixelsSum,
      loHi.unitBarMaxWidthPixelsCount,
      i,
      halfLineThickness,
      implicit,
      binStart,
    );
    loHi.unitBarMaxWidthPixelsSum = unitBarMaxWidthPixelsSum;
    loHi.unitBarMaxWidthPixelsCount = unitBarMaxWidthPixelsCount;
  }
};

/** @internal */
export const renderRaster =
  (
    ctx: CanvasRenderingContext2D,
    config: TimeslipConfig,
    dataState: DataState,
    fadeOutPixelWidth: number,
    emWidth: number,
    defaultMinorTickLabelFormat: TimeFormatter,
    defaultLabelFormat: TimeFormatter,
    yTickNumberFormatter: NumberFormatter,
    domainFrom: number,
    domainTo: number,
    getPixelX: NumericScale,
    cartesianWidth: number,
    cartesianHeight: number,
    niceTicks: number[],
    yUnitScale: NumericScale,
    layers: Layers,
  ) =>
  (
    loHi: LoHi,
    {
      labeled,
      intervals,
      minorTickLabelFormat,
      detailedLabelFormat,
      minimumTickPixelDistance,
      unit,
      unitMultiplier,
    }: AxisLayer<Interval>,
    i: number,
    a: Layers,
  ) => {
    const {
      valid,
      dataResponse: { rows },
    } = dataState;

    const minorLabelFormat = minorTickLabelFormat ?? defaultMinorTickLabelFormat;
    const labelFormat = detailedLabelFormat ?? minorLabelFormat ?? defaultLabelFormat;
    const textNestLevel = a.slice(0, i + 1).filter((layer) => layer.labeled).length;
    const lineNestLevel = a[i] === a[0] ? 0 : textNestLevel;
    const textNestLevelRowLimited = Math.min(config.maxLabelRowCount, textNestLevel); // max. N rows
    const lineNestLevelRowLimited = Math.min(config.maxLabelRowCount, lineNestLevel);
    const lineThickness = config.lineThicknessSteps[i];
    const luma =
      config.lumaSteps[i] *
      (config.darkMode ? (config.a11y.contrast === 'low' ? 0.5 : 1) : config.a11y.contrast === 'low' ? 1.5 : 1);
    const halfLineThickness = lineThickness / 2;
    const notTooDenseGridLayer = notTooDense(domainFrom, domainTo, 0, cartesianWidth, TIMESLIP_MAX_TIME_GRID_COUNT);

    const binStartList = binsToRender(intervals(domainFrom, domainTo), domainFrom, domainTo);

    updateLoHi(binStartList, config.implicit, halfLineThickness, getPixelX, loHi, i);

    const finestRaster = i === 0;
    const renderBar =
      finestRaster &&
      valid &&
      dataState.binUnit === layers[0].unit &&
      dataState.binUnitCount === layers[0].unitMultiplier;

    if (labeled && textNestLevel <= config.maxLabelRowCount)
      renderColumnTickLabels(
        ctx,
        config,
        fadeOutPixelWidth,
        emWidth,
        getPixelX,
        labelFormat,
        minorLabelFormat,
        textNestLevelRowLimited,
        cartesianWidth,
        binStartList,
      );

    if (renderBar)
      renderColumnBars(
        ctx,
        getPixelX,
        cartesianWidth,
        cartesianHeight,
        config.implicit ? halfLineThickness : 0,
        rows,
        yUnitScale,
        config.barChroma,
        config.barFillAlpha,
        binStartList,
      );
    if (notTooDenseGridLayer({ minimumTickPixelDistance, unit, unitMultiplier })) {
      const { rowPixelPitch } = config;
      ctx.fillStyle = `rgb(${luma},${luma},${luma})`;
      const lastBinForClosingGridline = binStartList.slice(-1).map((bin) => ({ ...bin, binStart: bin.supremum }));
      pipeline(
        [...binStartList, ...lastBinForClosingGridline],
        mapping(({ minimum }) => minimum),
        filtering((binStart) => binStart >= domainFrom),
        mapping(getPixelX),
        doing((pixelX: number) => {
          const left = pixelX - 0.5 * lineThickness;
          const height = cartesianHeight + lineNestLevelRowLimited * rowPixelPitch;
          ctx.fillRect(left, -cartesianHeight, lineThickness, height);
        }),
        executing,
      );
    }

    // render specially the tick that just precedes the domain, therefore may insert into it (eg. intentionally, via needing to see tick texts)
    if (binStartList.length > 0 && binStartList[0].minimum < domainFrom) {
      const precedingBinStart = binStartList[0];
      if (finestRaster) {
        // condition necessary, otherwise it'll be the binStart of some temporally coarser bin
        loHi.lo = precedingBinStart; // partial bin on the left
      }
      const { unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount } = calcColumnBar(
        getPixelX,
        loHi.unitBarMaxWidthPixelsSum,
        loHi.unitBarMaxWidthPixelsCount,
        i,
        halfLineThickness,
        config.implicit,
        precedingBinStart,
      );

      loHi.unitBarMaxWidthPixelsSum = unitBarMaxWidthPixelsSum;
      loHi.unitBarMaxWidthPixelsCount = unitBarMaxWidthPixelsCount;
    }

    renderHorizontalGridLines(
      ctx,
      config,
      niceTicks,
      yUnitScale,
      cartesianHeight,
      yTickNumberFormatter,
      cartesianWidth,
    );

    return loHi;
  };
