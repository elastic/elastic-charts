/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { area } from 'd3-shape';

import { renderPoints } from './points';
import {
  getClippedRanges,
  getY0ScaledValueFn,
  getY1ScaledValueFn,
  getYDatumValueFn,
  isYValueDefinedFn,
  MarkSizeOptions,
} from './utils';
import { Color } from '../../../common/colors';
import { ScaleBand, ScaleContinuous } from '../../../scales';
import { isBandScale } from '../../../scales/types';
import { CurveType, getCurveFactory } from '../../../utils/curves';
import { Dimensions } from '../../../utils/dimensions';
import { AreaGeometry } from '../../../utils/geometry';
import { AreaSeriesStyle } from '../../../utils/themes/theme';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { DataSeries, DataSeriesDatum, getSeriesIdentifierFromDataSeries } from '../utils/series';
import { PointStyleAccessor } from '../utils/specs';

/** @internal */
export function renderArea(
  shift: number,
  dataSeries: DataSeries,
  xScale: ScaleBand | ScaleContinuous,
  yScale: ScaleContinuous,
  panel: Dimensions,
  color: Color,
  curve: CurveType,
  isBandedSpec: boolean,
  xScaleOffset: number,
  style: AreaSeriesStyle,
  markSizeOptions: MarkSizeOptions,
  isStacked: boolean,
  hasFit: boolean,
  pointStyleAccessor?: PointStyleAccessor,
): {
  areaGeometry: AreaGeometry;
  indexedGeometryMap: IndexedGeometryMap;
} {
  const y1Fn = getY1ScaledValueFn(yScale);
  const y0Fn = getY0ScaledValueFn(yScale);
  const definedFn = isYValueDefinedFn(yScale, xScale);
  const y1DatumAccessor = getYDatumValueFn();
  const y0DatumAccessor = getYDatumValueFn('y0');
  const pathGenerator = area<DataSeriesDatum>()
    .x(({ x }) => xScale.scale(x) - xScaleOffset)
    .y1(y1Fn)
    .y0(y0Fn)
    .defined((datum) => {
      return definedFn(datum, y1DatumAccessor) && (isBandedSpec ? definedFn(datum, y0DatumAccessor) : true);
    })
    .curve(getCurveFactory(curve));

  // TODO we can probably avoid this function call if no fit function is applied.
  const clippedRanges = getClippedRanges(dataSeries.data, xScale, xScaleOffset);

  const lines: string[] = [];
  const y0Line = isBandedSpec && pathGenerator.lineY0()(dataSeries.data);
  const y1Line = pathGenerator.lineY1()(dataSeries.data);
  if (y1Line) lines.push(y1Line);
  if (y0Line) lines.push(y0Line);

  const { pointGeometries, indexedGeometryMap } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    panel,
    color,
    style.point,
    style.isolatedPoint,
    style.line.strokeWidth,
    isBandedSpec,
    markSizeOptions,
    false,
    style.isolatedPoint.enabled,
    pointStyleAccessor,
  );

  const areaGeometry: AreaGeometry = {
    area: pathGenerator(dataSeries.data) || '',
    lines,
    points: pointGeometries,
    color,
    transform: {
      y: 0,
      x: shift,
    },
    seriesIdentifier: getSeriesIdentifierFromDataSeries(dataSeries),
    style,
    isStacked,
    clippedRanges,
    shouldClip: hasFit,
    hasFit,
    minPointDistance: isBandScale(xScale) ? xScale.bandwidth : xScale.scale(xScale.domain[0] + xScale.minInterval),
  };
  return {
    areaGeometry,
    indexedGeometryMap,
  };
}
