/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MAX_TIME_TICK_COUNT, notTooDense } from '../../../xy_chart/axes/timeslip/multilayer_ticks';
import { BinUnit, TimeFormatter, rasters, TimeBin, NumberFormatter } from '../../../xy_chart/axes/timeslip/rasters';
import { DataState, NumericScale, TimeslipConfig } from '../timeslip_render';
import { renderRaster } from './raster';

/** @public */
export type DataDemand = {
  lo: TimeBin | null;
  hi: TimeBin | null;
  binUnit: BinUnit;
  binUnitCount: number;
  unitBarMaxWidthPixels: number;
};

/** @internal */
export const renderCartesian = (
  ctx: CanvasRenderingContext2D,
  config: TimeslipConfig,
  dataState: DataState,
  defaultMinorTickLabelFormat: TimeFormatter,
  emWidth: number,
  fadeOutPixelWidth: number,
  defaultLabelFormat: TimeFormatter,
  yTickNumberFormatter: NumberFormatter,
  rasterSelector: ReturnType<typeof rasters>,
  cartesianWidth: number,
  cartesianHeight: number,
  { domainFrom, domainTo }: { domainFrom: number; domainTo: number },
  yUnitScale: NumericScale,
  yUnitScaleClamped: NumericScale,
  niceTicks: number[],
): DataDemand => {
  ctx.textBaseline = 'top';
  ctx.fillStyle = config.defaultFontColor;
  ctx.font = config.cssFontShorthand;
  ctx.textAlign = 'left';

  const timeExtent = domainTo - domainFrom;

  const getPixelX = (timePointSec: number) => {
    const continuousOffset = timePointSec - domainFrom;
    const ratio = continuousOffset / timeExtent;
    return cartesianWidth * ratio;
  };

  const layers = rasterSelector(notTooDense(domainFrom, domainTo, 0, cartesianWidth, MAX_TIME_TICK_COUNT));

  const loHi = layers.reduce(
    renderRaster(
      ctx,
      config,
      dataState,
      fadeOutPixelWidth,
      emWidth,
      defaultMinorTickLabelFormat,
      defaultLabelFormat,
      yTickNumberFormatter,
      domainFrom,
      domainTo,
      getPixelX,
      cartesianWidth,
      cartesianHeight,
      niceTicks,
      yUnitScale,
      yUnitScaleClamped,
      layers,
    ),
    { lo: null, hi: null, unitBarMaxWidthPixelsSum: 0, unitBarMaxWidthPixelsCount: 0 },
  );

  return {
    lo: loHi.lo,
    hi: loHi.hi,
    binUnit: layers[0].unit,
    binUnitCount: layers[0].unitMultiplier,
    unitBarMaxWidthPixels: loHi.unitBarMaxWidthPixelsSum / loHi.unitBarMaxWidthPixelsCount,
  };
};
