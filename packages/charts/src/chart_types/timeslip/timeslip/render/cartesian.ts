/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderRaster } from './raster';
import {
  BinUnit,
  NumberFormatter,
  continuousTimeRasters,
  Interval,
  TimeFormatter,
} from '../../../xy_chart/axes/timeslip/continuous_time_rasters';
import { MAX_TIME_TICK_COUNT, notTooDense } from '../../../xy_chart/axes/timeslip/multilayer_ticks';
import { makeLinearScale, NumericScale } from '../../projections/scale';
import { TimeslipConfig } from '../config';
import { DataState } from '../data_fetch';

/** @public */
export type DataDemand = {
  lo: Interval | null;
  hi: Interval | null;
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
  rasterSelector: ReturnType<typeof continuousTimeRasters>,
  cartesianWidth: number,
  cartesianHeight: number,
  { domainFrom, domainTo }: { domainFrom: number; domainTo: number },
  yUnitScale: NumericScale,
  niceTicks: number[],
): DataDemand => {
  ctx.textBaseline = 'top';
  ctx.fillStyle = config.defaultFontColor;
  ctx.font = config.cssFontShorthand;
  ctx.textAlign = 'left';

  const getPixelX = makeLinearScale(domainFrom, domainTo, 0, cartesianWidth);
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
      layers,
    ),
    { lo: null, hi: null, unitBarMaxWidthPixelsSum: 0, unitBarMaxWidthPixelsCount: 0 },
  );

  const finestLayer = layers[0];

  return {
    lo: loHi.lo,
    hi: loHi.hi,
    binUnit: finestLayer?.unit ?? 'millisecond',
    binUnitCount: finestLayer?.unitMultiplier ?? 1,
    unitBarMaxWidthPixels: loHi.unitBarMaxWidthPixelsSum / loHi.unitBarMaxWidthPixelsCount,
  };
};
