/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { area } from 'd3-shape';

import { Scale } from '../../../scales';
import { Color } from '../../../utils/common';
import { CurveType, getCurveFactory } from '../../../utils/curves';
import { Dimensions } from '../../../utils/dimensions';
import { AreaGeometry } from '../../../utils/geometry';
import { AreaSeriesStyle } from '../../../utils/themes/theme';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { DataSeries, DataSeriesDatum } from '../utils/series';
import { PointStyleAccessor } from '../utils/specs';
import { renderPoints } from './points';
import {
  getClippedRanges,
  getY0ScaledValueOrThrowFn,
  getY1ScaledValueOrThrowFn,
  getYDatumValueFn,
  isYValueDefinedFn,
  MarkSizeOptions,
} from './utils';

/** @internal */
export function renderArea(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale<any>,
  yScale: Scale<any>,
  panel: Dimensions,
  color: Color,
  curve: CurveType,
  hasY0Accessors: boolean,
  xScaleOffset: number,
  seriesStyle: AreaSeriesStyle,
  markSizeOptions: MarkSizeOptions,
  isStacked = false,
  pointStyleAccessor?: PointStyleAccessor,
  hasFit?: boolean,
): {
  areaGeometry: AreaGeometry;
  indexedGeometryMap: IndexedGeometryMap;
} {
  const y1Fn = getY1ScaledValueOrThrowFn(yScale);
  const y0Fn = getY0ScaledValueOrThrowFn(yScale);
  const definedFn = isYValueDefinedFn(yScale, xScale);
  const y1DatumAccessor = getYDatumValueFn();
  const y0DatumAccessor = getYDatumValueFn('y0');
  const pathGenerator = area<DataSeriesDatum>()
    .x(({ x }) => xScale.scaleOrThrow(x) - xScaleOffset)
    .y1(y1Fn)
    .y0(y0Fn)
    .defined((datum) => {
      return definedFn(datum, y1DatumAccessor) && (hasY0Accessors ? definedFn(datum, y0DatumAccessor) : true);
    })
    .curve(getCurveFactory(curve));

  const clippedRanges = getClippedRanges(dataSeries.data, xScale, xScaleOffset);

  let y1Line: string | null;

  try {
    y1Line = pathGenerator.lineY1()(dataSeries.data);
  } catch {
    // When values are not scalable
    y1Line = null;
  }

  const lines: string[] = [];
  if (y1Line) {
    lines.push(y1Line);
  }
  if (hasY0Accessors) {
    let y0Line: string | null;

    try {
      y0Line = pathGenerator.lineY0()(dataSeries.data);
    } catch {
      // When values are not scalable
      y0Line = null;
    }
    if (y0Line) {
      lines.push(y0Line);
    }
  }

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
    false,
  );

  let areaPath: string;

  try {
    areaPath = pathGenerator(dataSeries.data) || '';
  } catch {
    // When values are not scalable
    areaPath = '';
  }

  const areaGeometry: AreaGeometry = {
    area: areaPath,
    lines,
    points: pointGeometries,
    color,
    transform: {
      y: 0,
      x: shift,
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
    seriesAreaStyle: seriesStyle.area,
    seriesAreaLineStyle: seriesStyle.line,
    seriesPointStyle: seriesStyle.point,
    isStacked,
    clippedRanges,
    hideClippedRanges: !hasFit,
  };
  return {
    areaGeometry,
    indexedGeometryMap,
  };
}
