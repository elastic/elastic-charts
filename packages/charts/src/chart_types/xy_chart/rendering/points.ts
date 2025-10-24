/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildPointGeometryStyles } from './point_style';
import type { MarkSizeOptions } from './utils';
import { getY0ScaledValueFn, getY1ScaledValueFn, getYDatumValueFn, isDatumFilled, isYValueDefinedFn } from './utils';
import type { Color } from '../../../common/colors';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import type { RecursivePartial } from '../../../utils/common';
import { isFiniteNumber, isNil } from '../../../utils/common';
import type { SortedArray } from '../../../utils/data/data_processing';
import { inplaceInsertInSortedArray } from '../../../utils/data/data_processing';
import type { Dimensions } from '../../../utils/dimensions';
import type { PointGeometry } from '../../../utils/geometry';
import { BandedAccessorType } from '../../../utils/geometry';
import type { PointStyle } from '../../../utils/themes/theme';
import { GeometryType, IndexedGeometryMap } from '../utils/indexed_geometry_map';
import type { DataSeries, DataSeriesDatum, FilledValues, XYChartSeriesIdentifier } from '../utils/series';
import { getSeriesIdentifierFromDataSeries } from '../utils/series';
import type { PointStyleAccessor } from '../utils/specs';
import { StackMode } from '../utils/specs';

/** @internal */
export function isolatedPointRadius(lineStrokeWidth: number) {
  return lineStrokeWidth + 0.5;
}

/** @internal */
export function renderPoints(
  shift: number,
  dataSeries: DataSeries,
  xScale: ScaleBand | ScaleContinuous,
  yScale: ScaleContinuous,
  panel: Dimensions,
  color: Color,
  pointStyle: PointStyle,
  considerIsolatedPoints: boolean,
  isBandedSpec: boolean,
  markSizeOptions: MarkSizeOptions,
  useSpatialIndex: boolean,
  styleAccessor?: PointStyleAccessor,
): {
  pointGeometries: PointGeometry[];
  minDistanceBetweenPoints: number;
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

  const needSorting = !markSizeOptions.enabled;

  let style = buildPointGeometryStyles(color, pointStyle);
  const seriesIdentifier = getSeriesIdentifierFromDataSeries(dataSeries);
  const { pointGeometries, minDistanceBetweenPoints } = dataSeries.data.reduce<{
    pointGeometries: SortedArray<PointGeometry>;
    minDistanceBetweenPoints: number;
    prevX: number | undefined;
  }>(
    (acc, datum, dataIndex) => {
      const { x: xValue, mark } = datum;
      // don't create the point if not within the xScale domain
      if (!xScale.isValueInDomain(xValue)) return acc;
      // don't create the point if it that point was filled
      const x = xScale.scale(xValue);
      if (!isFiniteNumber(x)) return acc;

      const prev = dataSeries.data[dataIndex - 1];
      const next = dataSeries.data[dataIndex + 1];

      if (isFiniteNumber(acc.prevX) && !isDatumFilled(datum)) {
        acc.minDistanceBetweenPoints = Math.min(acc.minDistanceBetweenPoints, Math.abs(x - acc.prevX));
      }
      acc.prevX = x;

      const yDatumKeyNames: Array<keyof Omit<FilledValues, 'x'>> = isBandedSpec ? ['y0', 'y1'] : ['y1'];

      const isPointIsolated = considerIsolatedPoints
        ? isIsolatedPoint(dataIndex, dataSeries.data.length, datum, isBandedSpec, y1Fn, y0Fn, prev, next)
        : false;
      let styleOverrides: RecursivePartial<PointStyle> | undefined = undefined;
      if (styleAccessor) {
        styleOverrides = getPointStyleOverrides(datum, seriesIdentifier, isPointIsolated, styleAccessor);
        style = buildPointGeometryStyles(color, pointStyle, styleOverrides);
      }
      yDatumKeyNames.forEach((yDatumKeyName, keyIndex) => {
        const valueAccessor = getYDatumValueFn(yDatumKeyName);
        const y = yDatumKeyName === 'y1' ? y1Fn(datum) : y0Fn(datum);
        const originalY = getDatumYValue(datum, keyIndex === 0, isBandedSpec, dataSeries.stackMode);

        // if radius is defined with the mark, limit the minimum radius to the theme radius value
        const radius = markSizeOptions.enabled
          ? Math.max(getRadius(mark), pointStyle.radius)
          : styleOverrides?.radius ?? pointStyle.radius;

        const pointGeometry: PointGeometry = {
          x,
          y: y === null ? NaN : y,
          radius,
          color,
          style,
          value: {
            x: xValue,
            y: originalY,
            mark,
            accessor: isBandedSpec && keyIndex === 0 ? BandedAccessorType.Y0 : BandedAccessorType.Y1,
            datum: datum.datum,
          },
          transform: {
            x: shift,
            y: 0,
          },
          seriesIdentifier,
          panel,
          isolated: isPointIsolated,
        };
        indexedGeometryMap.set(pointGeometry, geometryType);
        // use the geometry only if the yDatum in contained in the current yScale domain
        if (
          isFiniteNumber(y) &&
          yDefined(datum, valueAccessor) &&
          yScale.isValueInDomain(valueAccessor(datum)) &&
          !isDatumFilled(datum)
        ) {
          if (needSorting) {
            inplaceInsertInSortedArray(acc.pointGeometries, pointGeometry, (p) => p?.radius ?? NaN);
          } else {
            acc.pointGeometries.push(pointGeometry);
          }
        }
      });
      return acc;
    },
    { pointGeometries: [], minDistanceBetweenPoints: Infinity, prevX: undefined },
  );
  return {
    pointGeometries,
    minDistanceBetweenPoints,
    indexedGeometryMap,
  };
}

/** @internal */
export function getPointStyleOverrides(
  datum: DataSeriesDatum,
  seriesIdentifier: XYChartSeriesIdentifier,
  isolatedPoint: boolean,
  pointStyleAccessor?: PointStyleAccessor,
): RecursivePartial<PointStyle> | undefined {
  const styleOverride = pointStyleAccessor && pointStyleAccessor(datum, seriesIdentifier, isolatedPoint);

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
 * @param isBandedSpec if the chart is a band chart
 * @param stackMode an optional stack mode
 * @internal
 */
export function getDatumYValue(
  { y1, y0, initialY1, initialY0 }: DataSeriesDatum,
  lookingForY0: boolean,
  isBandedSpec: boolean,
  stackMode?: StackMode,
) {
  if (isBandedSpec) {
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

/**
 * Determines if a datum's initial (original, pre-stacking) values are defined and valid for rendering.
 *
 * Checks that the datum has not been filled on the x, y1, or (if applicable) y0 values,
 * and that the initialY1 (and initialY0 for banded specs) are finite numbers.
 * Also ensures that the scaled y1 (and y0 for banded specs) values are finite,
 * which is important for scale types like log that may produce invalid values for some inputs.
 *
 * The "initial" values refer to the original datum values before any stacking or transformation is applied.
 *
 * @param datum - The data series datum to check.
 * @param isBandedSpec - Whether the series is a banded spec (e.g., area band).
 * @param y1Scale - Function to scale the datum's y1 value.
 * @param y0Scale - Function to scale the datum's y0 value.
 * @returns True if the datum's initial values are defined and valid for rendering; otherwise, false.
 */
function isInitialDatumDefined(
  datum: DataSeriesDatum,
  isBandedSpec: boolean,
  y1Scale: (d: DataSeriesDatum) => number,
  y0Scale: (d: DataSeriesDatum) => number,
) {
  return (
    // not filled on x
    isNil(datum.filled?.x) &&
    // not filled on y1
    isNil(datum.filled?.y1) &&
    // finite initial/original Y1
    isFiniteNumber(datum.initialY1) &&
    // and the scaled value is finite (e.g. no log(-1))
    isFiniteNumber(y1Scale(datum)) &&
    // same for y0 if band spec
    (isBandedSpec ? isNil(datum.filled?.y0) && isFiniteNumber(datum.initialY0) && isFiniteNumber(y0Scale(datum)) : true)
  );
}

function isIsolatedPoint(
  index: number,
  length: number,
  current: DataSeriesDatum,
  isBandedSpec: boolean,
  y1Scale: (datum: DataSeriesDatum) => number,
  y0Scale: (datum: DataSeriesDatum) => number,
  prev?: DataSeriesDatum,
  next?: DataSeriesDatum,
): boolean {
  if (!isInitialDatumDefined(current, isBandedSpec, y1Scale, y0Scale)) {
    return true;
  }
  const isNextNotDefined = isNil(next) || !isInitialDatumDefined(next, isBandedSpec, y1Scale, y0Scale);
  if (index === 0 && isNextNotDefined) {
    return true;
  }
  const isPrevNotDefined = isNil(prev) || !isInitialDatumDefined(prev, isBandedSpec, y1Scale, y0Scale);
  if (index === length - 1 && isPrevNotDefined) {
    return true;
  }
  return isNextNotDefined && isPrevNotDefined;
}
