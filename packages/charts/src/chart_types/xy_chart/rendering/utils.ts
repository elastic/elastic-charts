/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItem } from '../../../common/legend';
import { ScaleBand, ScaleContinuous } from '../../../scales';
import { isLogarithmicScale } from '../../../scales/types';
import { MarkBuffer } from '../../../specs';
import { getDistance } from '../../../utils/common';
import { BarGeometry, ClippedRanges, isPointGeometry, PointGeometry } from '../../../utils/geometry';
import { GeometryStateStyle, SharedGeometryStateStyle } from '../../../utils/themes/theme';
import { DataSeriesDatum, FilledValues, XYChartSeriesIdentifier } from '../utils/series';

/** @internal */
export interface MarkSizeOptions {
  enabled: boolean;
  ratio?: number;
}

/**
 * Returns value of `y1` or `filled.y1` or null by default.
 * Passing a filled key (x, y1, y0) it will return that value or the filled one
 * @internal
 */
export function getYDatumValueFn(valueName: keyof Omit<FilledValues, 'x'> = 'y1') {
  return (datum: DataSeriesDatum, returnFilled = true): number | null => {
    const value = datum[valueName];
    if (value !== null || !returnFilled) {
      return value;
    }
    return datum.filled?.[valueName] ?? null;
  };
}

/**
 *
 * @param param0
 * @internal
 */
export function isDatumFilled({ filled, initialY1 }: DataSeriesDatum) {
  return filled?.x !== undefined || filled?.y1 !== undefined || initialY1 === null || initialY1 === undefined;
}

/**
 * Gets clipped ranges that have been fitted to values
 * @param dataset
 * @param xScale
 * @param xScaleOffset
 * @internal
 */
export function getClippedRanges(
  dataset: DataSeriesDatum[],
  xScale: ScaleBand | ScaleContinuous,
  xScaleOffset: number,
): ClippedRanges {
  let firstNonNullX: number | null = null;
  let hasNull = false;

  const completeDatasetIsNull = dataset.every((datum) => isDatumFilled(datum));

  if (completeDatasetIsNull) return [[xScale.range[0], xScale.range[1]]];

  return dataset.reduce<ClippedRanges>((acc, data) => {
    const xScaled = xScale.scale(data.x);
    if (Number.isNaN(xScaled)) return acc;

    const xValue = xScaled - xScaleOffset + xScale.bandwidth / 2;

    if (isDatumFilled(data)) {
      const endXValue = xScale.range[1] - xScale.bandwidth * (2 / 3);
      if (firstNonNullX !== null && xValue === endXValue) {
        acc.push([firstNonNullX, xValue]);
      }
      hasNull = true;
    } else {
      if (hasNull) {
        if (firstNonNullX !== null) {
          acc.push([firstNonNullX, xValue]);
        } else {
          acc.push([0, xValue]);
        }
        hasNull = false;
      }

      firstNonNullX = xValue;
    }
    return acc;
  }, []);
}

/** @internal */
export function getGeometryStateStyle(
  seriesIdentifier: XYChartSeriesIdentifier,
  sharedGeometryStyle: SharedGeometryStateStyle,
  highlightedLegendItem?: LegendItem,
): GeometryStateStyle {
  const { default: defaultStyles, highlighted, unhighlighted } = sharedGeometryStyle;

  if (highlightedLegendItem) {
    const isPartOfHighlightedSeries = highlightedLegendItem.seriesIdentifiers.some(
      ({ key }) => key === seriesIdentifier.key,
    );

    return isPartOfHighlightedSeries ? highlighted : unhighlighted;
  }

  return defaultStyles;
}

/** @internal */
export function isPointOnGeometry(
  xCoordinate: number,
  yCoordinate: number,
  indexedGeometry: BarGeometry | PointGeometry,
  buffer: MarkBuffer,
) {
  const { x, y, transform } = indexedGeometry;
  if (isPointGeometry(indexedGeometry)) {
    const { radius } = indexedGeometry;
    const distance = getDistance(
      {
        x: xCoordinate,
        y: yCoordinate,
      },
      {
        x: x + transform.x,
        y: y + transform.y,
      },
    );

    const radiusBuffer = typeof buffer === 'number' ? buffer : buffer(radius);

    return distance <= radius + radiusBuffer;
  }
  const { width, height } = indexedGeometry;
  return yCoordinate >= y && yCoordinate <= y + height && xCoordinate >= x && xCoordinate <= x + width;
}

const getScaleTypeValueValidator = (yScale: ScaleContinuous): ((n: number) => boolean) => {
  if (!isLogarithmicScale(yScale)) return () => true;
  const domainPolarity = getDomainPolarity(yScale.domain);
  return (yValue: number) => domainPolarity === Math.sign(yValue);
};

/**
 * The default zero baseline for area charts.
 */
const DEFAULT_ZERO_BASELINE = 0;

/** @internal */
export type YDefinedFn = (datum: DataSeriesDatum, getValueAccessor: (d: DataSeriesDatum) => number | null) => boolean;

/** @internal */
export function isYValueDefinedFn(yScale: ScaleContinuous, xScale: ScaleBand | ScaleContinuous): YDefinedFn {
  const validator = getScaleTypeValueValidator(yScale);
  return (datum, getValueAccessor) => {
    const yValue = getValueAccessor(datum);
    return yValue !== null && validator(yValue) && xScale.isValueInDomain(datum.x);
  };
}

/** @internal */
export const CHROME_PINCH_BUG_EPSILON = 0.5;

/**
 * Temporary fix for Chromium bug
 * Shift a small pixel value when pixel diff is <= 0.5px
 * https://github.com/elastic/elastic-charts/issues/1053
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1163912
 */
function chromeRenderBugBuffer(y1: number, y0: number): number {
  return Math.abs(y1 - y0) <= CHROME_PINCH_BUG_EPSILON ? 0.5 : 0;
}

/** @internal */
export function getY1ScaledValueFn(yScale: ScaleContinuous): (datum: DataSeriesDatum) => number {
  const datumAccessor = getYDatumValueFn();
  const scaleY0Value = getY0ScaledValueFn(yScale);
  return (datum) => {
    const y1Value = yScale.scale(datumAccessor(datum));
    const y0Value = scaleY0Value(datum);
    return y1Value - chromeRenderBugBuffer(y1Value, y0Value);
  };
}

/** @internal */
export function getY0ScaledValueFn(yScale: ScaleContinuous): (datum: DataSeriesDatum) => number {
  const domainPolarity = getDomainPolarity(yScale.domain);
  const logBaseline = domainPolarity >= 0 ? Math.min(...yScale.domain) : Math.max(...yScale.domain);
  return ({ y0 }) =>
    isLogarithmicScale(yScale) // checking wrong y0 polarity
      ? y0 === null || domainPolarity !== Math.sign(y0) // if all positive domain use 1 as baseline, -1 otherwise
        ? yScale.scale(logBaseline)
        : yScale.scale(y0) // if negative value, use -1 as max reference, 1 otherwise
      : yScale.scale(y0 === null ? DEFAULT_ZERO_BASELINE : y0);
}

function getDomainPolarity(domain: number[]): number {
  // 1 if both numbers are positive, -1 if both are negative, 0 if zeros or mixed
  return Math.sign(Math.sign(domain[0] ?? NaN) + Math.sign(domain[1] ?? NaN));
}
