/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { line } from 'd3-shape';

import { renderPoints } from './points';
import { getClippedRanges, getY1ScaledValueFn, getYDatumValueFn, isYValueDefinedFn, MarkSizeOptions } from './utils';
import { Color } from '../../../common/colors';
import { ScaleBand, ScaleContinuous } from '../../../scales';
import { CurveType, getCurveFactory } from '../../../utils/curves';
import { Dimensions } from '../../../utils/dimensions';
import { LineGeometry } from '../../../utils/geometry';
import { LineSeriesStyle } from '../../../utils/themes/theme';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { DataSeries, DataSeriesDatum, getSeriesIdentifierFromDataSeries } from '../utils/series';
import { PointStyleAccessor } from '../utils/specs';

/** @internal */
export function renderLine(
  shift: number,
  dataSeries: DataSeries,
  xScale: ScaleBand | ScaleContinuous,
  yScale: ScaleContinuous,
  panel: Dimensions,
  color: Color,
  curve: CurveType,
  hasY0Accessors: boolean,
  xScaleOffset: number,
  seriesStyle: LineSeriesStyle,
  markSizeOptions: MarkSizeOptions,
  hasFit: boolean,
  pointStyleAccessor?: PointStyleAccessor,
): {
  lineGeometry: LineGeometry;
  indexedGeometryMap: IndexedGeometryMap;
} {
  const y1Fn = getY1ScaledValueFn(yScale);
  const definedFn = isYValueDefinedFn(yScale, xScale);
  const y1Accessor = getYDatumValueFn();

  const pathGenerator = line<DataSeriesDatum>()
    .x(({ x }) => xScale.scale(x) - xScaleOffset)
    .y(y1Fn)
    .defined((datum) => definedFn(datum, y1Accessor))
    .curve(getCurveFactory(curve));

  const { pointGeometries, indexedGeometryMap } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    panel,
    color,
    seriesStyle.point,
    seriesStyle.isolatedPoint,
    hasY0Accessors,
    markSizeOptions,
    false,
    pointStyleAccessor,
  );

  // TODO we can probably avoid computing the clipped ranges if no fit function is applied.
  const clippedRanges = getClippedRanges(dataSeries.data, xScale, xScaleOffset);

  const lineGeometry = {
    line: pathGenerator(dataSeries.data) || '',
    points: pointGeometries,
    color,
    transform: {
      x: shift,
      y: 0,
    },
    seriesIdentifier: getSeriesIdentifierFromDataSeries(dataSeries),
    style: seriesStyle,
    clippedRanges,
    shouldClip: hasFit,
  };
  return {
    lineGeometry,
    indexedGeometryMap,
  };
}
