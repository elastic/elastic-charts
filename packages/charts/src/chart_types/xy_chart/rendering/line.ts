/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { line } from 'd3-shape';

import { Scale } from '../../../scales';
import { Color } from '../../../utils/common';
import { CurveType, getCurveFactory } from '../../../utils/curves';
import { Dimensions } from '../../../utils/dimensions';
import { LineGeometry } from '../../../utils/geometry';
import { LineSeriesStyle } from '../../../utils/themes/theme';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { DataSeries, DataSeriesDatum } from '../utils/series';
import { PointStyleAccessor } from '../utils/specs';
import { renderPoints } from './points';
import {
  getClippedRanges,
  getY1ScaledValueOrThrowFn,
  getYDatumValueFn,
  isYValueDefinedFn,
  MarkSizeOptions,
} from './utils';

/** @internal */
export function renderLine(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  panel: Dimensions,
  color: Color,
  curve: CurveType,
  hasY0Accessors: boolean,
  xScaleOffset: number,
  seriesStyle: LineSeriesStyle,
  markSizeOptions: MarkSizeOptions,
  pointStyleAccessor?: PointStyleAccessor,
  hasFit?: boolean,
): {
  lineGeometry: LineGeometry;
  indexedGeometryMap: IndexedGeometryMap;
} {
  const y1Fn = getY1ScaledValueOrThrowFn(yScale);
  const definedFn = isYValueDefinedFn(yScale, xScale);
  const y1Accessor = getYDatumValueFn();

  const pathGenerator = line<DataSeriesDatum>()
    .x(({ x }) => xScale.scaleOrThrow(x) - xScaleOffset)
    .y(y1Fn)
    .defined((datum) => {
      return definedFn(datum, y1Accessor);
    })
    .curve(getCurveFactory(curve));

  const { pointGeometries, indexedGeometryMap } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    panel,
    color,
    seriesStyle.point,
    hasY0Accessors,
    markSizeOptions,
    pointStyleAccessor,
  );

  const clippedRanges = getClippedRanges(dataSeries.data, xScale, xScaleOffset);
  let linePath: string;

  try {
    linePath = pathGenerator(dataSeries.data) || '';
  } catch {
    // When values are not scalable
    linePath = '';
  }

  const lineGeometry = {
    line: linePath,
    points: pointGeometries,
    color,
    transform: {
      x: shift,
      y: 0,
    },
    seriesIdentifier: {
      key: dataSeries.key,
      specId: dataSeries.specId,
      yAccessor: dataSeries.yAccessor,
      splitAccessors: dataSeries.splitAccessors,
      seriesKeys: dataSeries.seriesKeys,
      smHorizontalAccessorValue: dataSeries.smHorizontalAccessorValue,
      smVerticalAccessorValue: dataSeries.smVerticalAccessorValue,
    },
    seriesLineStyle: seriesStyle.line,
    seriesPointStyle: seriesStyle.point,
    clippedRanges,
    hideClippedRanges: !hasFit,
  };
  return {
    lineGeometry,
    indexedGeometryMap,
  };
}
