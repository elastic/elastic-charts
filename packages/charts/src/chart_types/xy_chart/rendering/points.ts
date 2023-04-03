/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildPointGeometryStyles } from './point_style';
import {
  getY0ScaledValueFn,
  getY1ScaledValueFn,
  getYDatumValueFn,
  isDatumFilled,
  isYValueDefinedFn,
  MarkSizeOptions,
  YDefinedFn,
} from './utils';
import { colorToRgba } from '../../../common/color_library_wrappers';
import { Color } from '../../../common/colors';
import { ScaleBand, ScaleContinuous } from '../../../scales';
import { isFiniteNumber, isNil } from '../../../utils/common';
import { Dimensions } from '../../../utils/dimensions';
import { BandedAccessorType, PointGeometry } from '../../../utils/geometry';
import { PointShape, PointStyle } from '../../../utils/themes/theme';
import { GeometryType, IndexedGeometryMap } from '../utils/indexed_geometry_map';
import {
  DataSeries,
  DataSeriesDatum,
  FilledValues,
  getSeriesIdentifierFromDataSeries,
  XYChartSeriesIdentifier,
} from '../utils/series';
import { PointStyleAccessor, StackMode } from '../utils/specs';

/** @internal */
export function renderPoints(
  shift: number,
  dataSeries: DataSeries,
  xScale: ScaleBand | ScaleContinuous,
  yScale: ScaleContinuous,
  panel: Dimensions,
  color: Color,
  pointStyle: PointStyle,
  isBandChart: boolean,
  markSizeOptions: MarkSizeOptions,
  useSpatialIndex: boolean,
  styleAccessor?: PointStyleAccessor,
  lineWidth = 1,
): {
  pointGeometries: PointGeometry[];
  indexedGeometryMap: IndexedGeometryMap;
} {
  const indexedGeometryMap = new IndexedGeometryMap();
  const getRadius = markSizeOptions.enabled
    ? getRadiusFn(dataSeries.data, pointStyle.strokeWidth, markSizeOptions.ratio)
    : () => 0;
  const geometryType = useSpatialIndex ? GeometryType.spatial : GeometryType.linear;

  const y1Fn = getY1ScaledValueFn(yScale);
  const y0Fn = getY0ScaledValueFn(yScale);
  const yDefined = isYValueDefinedFn(yScale, xScale);

  const pointGeometries = dataSeries.data.reduce((acc, datum, dataIndex) => {
    const { x: xValue, mark } = datum;
    const prev = dataSeries.data[dataIndex - 1];
    const next = dataSeries.data[dataIndex + 1];
    // don't create the point if not within the xScale domain
    if (!xScale.isValueInDomain(xValue)) return acc;

    // don't create the point if it that point was filled
    const x = xScale.scale(xValue);

    if (Number.isNaN(x)) return acc;

    const points: PointGeometry[] = [];
    const yDatumKeyNames: Array<keyof Omit<FilledValues, 'x'>> = isBandChart ? ['y0', 'y1'] : ['y1'];

    yDatumKeyNames.forEach((yDatumKeyName, keyIndex) => {
      const valueAccessor = getYDatumValueFn(yDatumKeyName);
      const y = yDatumKeyName === 'y1' ? y1Fn(datum) : y0Fn(datum);
      const originalY = getDatumYValue(datum, keyIndex === 0, isBandChart, dataSeries.stackMode);
      const seriesIdentifier: XYChartSeriesIdentifier = getSeriesIdentifierFromDataSeries(dataSeries);
      const styleOverrides = getPointStyleOverrides(datum, seriesIdentifier, styleAccessor);
      const style = buildPointGeometryStyles(color, pointStyle, styleOverrides);
      const orphan = isOrphanDataPoint(dataIndex, dataSeries.data.length, yDefined, prev, next);
      // if radius is defined with the mark, limit the minimum radius to the theme radius value
      const radius =
        orphan && !pointStyle.visible
          ? lineWidth * 0.8
          : markSizeOptions.enabled
          ? Math.max(getRadius(mark), pointStyle.radius)
          : styleOverrides?.radius ?? pointStyle.radius;

      const pointGeometry: PointGeometry = {
        x,
        y: y === null ? NaN : y,
        radius,
        color,
        style:
          orphan && !pointStyle.visible
            ? {
                fill: { color: colorToRgba(color) },
                stroke: { width: 0, color: colorToRgba(color) },
                shape: PointShape.Circle,
              }
            : style,
        value: {
          x: xValue,
          y: originalY,
          mark,
          accessor: isBandChart && keyIndex === 0 ? BandedAccessorType.Y0 : BandedAccessorType.Y1,
          datum: datum.datum,
        },
        transform: {
          x: shift,
          y: 0,
        },
        seriesIdentifier,
        panel,
        orphan,
      };
      indexedGeometryMap.set(pointGeometry, geometryType);
      // use the geometry only if the yDatum in contained in the current yScale domain
      if (
        isFiniteNumber(y) &&
        yDefined(datum, valueAccessor) &&
        yScale.isValueInDomain(valueAccessor(datum)) &&
        !isDatumFilled(datum)
      ) {
        points.push(pointGeometry);
      }
    });
    return [...acc, ...points];
  }, [] as PointGeometry[]);
  return {
    pointGeometries,
    indexedGeometryMap,
  };
}

/** @internal */
export function getPointStyleOverrides(
  datum: DataSeriesDatum,
  seriesIdentifier: XYChartSeriesIdentifier,
  pointStyleAccessor?: PointStyleAccessor,
): Partial<PointStyle> | undefined {
  const styleOverride = pointStyleAccessor && pointStyleAccessor(datum, seriesIdentifier);

  if (!styleOverride) {
    return;
  }

  if (typeof styleOverride === 'string') {
    return {
      stroke: styleOverride,
    };
  }

  return styleOverride;
}

/**
 * Get the original/initial Y value from the datum
 * @param datum a DataSeriesDatum
 * @param lookingForY0 if we are interested in the y0 value, false for y1
 * @param isBandChart if the chart is a band chart
 * @param stackMode an optional stack mode
 * @internal
 */
export function getDatumYValue(
  { y1, y0, initialY1, initialY0 }: DataSeriesDatum,
  lookingForY0: boolean,
  isBandChart: boolean,
  stackMode?: StackMode,
) {
  if (isBandChart) {
    // on band stacked charts in percentage mode, the values I'm looking for are the percentage value
    // that are already computed and available on y0 and y1
    // in all other cases for band charts, I want to get back the original/initial value of y0 and y1
    // not the computed value
    return stackMode === StackMode.Percentage ? (lookingForY0 ? y0 : y1) : lookingForY0 ? initialY0 : initialY1;
  }
  // if not a band chart get use the original/initial value in every case except for stack as percentage
  // in this case, we should take the difference between the bottom position of the bar and the top position
  // of the bar
  return stackMode === StackMode.Percentage ? (isNil(y1) || isNil(initialY1) ? null : y1 - (y0 ?? 0)) : initialY1;
}

/**
 * Get radius function form ratio and min/max mark size
 *
 * @todo add continuous/non-stepped function
 *
 * @param  {DataSeriesDatum[]} data
 * @param  {number} lineWidth
 * @param  {number=50} markSizeRatio - 0 to 100
 * @internal
 */
export function getRadiusFn(
  data: DataSeriesDatum[],
  lineWidth: number,
  markSizeRatio: number = 50,
): (mark: number | null, defaultRadius?: number) => number {
  if (data.length === 0) {
    return () => 0;
  }
  const { min, max } = data.reduce(
    (acc, { mark }) =>
      mark === null
        ? acc
        : {
            min: Math.min(acc.min, mark / 2),
            max: Math.max(acc.max, mark / 2),
          },
    { min: Infinity, max: -Infinity },
  );
  const adjustedMarkSizeRatio = Math.min(Math.max(markSizeRatio, 0), 100);
  const radiusStep = (max - min || max * 100) / Math.pow(adjustedMarkSizeRatio, 2);
  return function getRadius(mark, defaultRadius = 0): number {
    if (mark === null) {
      return defaultRadius;
    }
    const circleRadius = (mark / 2 - min) / radiusStep;
    const baseMagicNumber = 2;
    return circleRadius ? Math.sqrt(circleRadius + baseMagicNumber) + lineWidth : lineWidth;
  };
}

function yAccessorForOrphanCheck(datum: DataSeriesDatum): number | null {
  return datum.filled?.y1 ? null : datum.y1;
}

function isOrphanDataPoint(
  index: number,
  length: number,
  yDefined: YDefinedFn,
  prev?: DataSeriesDatum,
  next?: DataSeriesDatum,
): boolean {
  if (index === 0 && (isNil(next) || !yDefined(next, yAccessorForOrphanCheck))) {
    return true;
  }
  if (index === length - 1 && (isNil(prev) || !yDefined(prev, yAccessorForOrphanCheck))) {
    return true;
  }
  return (
    (isNil(prev) || !yDefined(prev, yAccessorForOrphanCheck)) &&
    (isNil(next) || !yDefined(next, yAccessorForOrphanCheck))
  );
}
