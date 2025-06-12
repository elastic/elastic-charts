/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { line } from 'd3-shape';

import { renderPoints } from './points';
import type { MarkSizeOptions } from './utils';
import { getClippedRanges, getY1ScaledValueFn, getYDatumValueFn, isYValueDefinedFn } from './utils';
import type { Color } from '../../../common/colors';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import type { CurveType } from '../../../utils/curves';
import { getCurveFactory } from '../../../utils/curves';
import type { Dimensions } from '../../../utils/dimensions';
import type { LineGeometry } from '../../../utils/geometry';
import type { LineSeriesStyle } from '../../../utils/themes/theme';
import type { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import type { DataSeries, DataSeriesDatum } from '../utils/series';
import { getSeriesIdentifierFromDataSeries } from '../utils/series';
import type { PointStyleAccessor } from '../utils/specs';

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
  style: LineSeriesStyle,
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

  const { pointGeometries, indexedGeometryMap, minDistanceBetweenPoints } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    panel,
    color,
    style.point,
    true,
    style.line.strokeWidth,
    hasY0Accessors,
    markSizeOptions,
    false,
    pointStyleAccessor,
  );

  // TODO we can probably avoid computing the clipped ranges if no fit function is applied.
  const clippedRanges = getClippedRanges(dataSeries.data, xScale, xScaleOffset);

  const lineGeometry: LineGeometry = {
    line: pathGenerator(dataSeries.data) || '',
    points: pointGeometries,
    color,
    transform: {
      x: shift,
      y: 0,
    },
    seriesIdentifier: getSeriesIdentifierFromDataSeries(dataSeries),
    style,
    clippedRanges,
    shouldClip: hasFit,
    hasFit,
    minPointDistance: minDistanceBetweenPoints,
  };
  return { lineGeometry, indexedGeometryMap };
}
