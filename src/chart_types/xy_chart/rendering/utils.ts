/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { LegendItem } from '../../../commons/legend';
import { Scale } from '../../../scales';
import { LOG_MIN_ABS_DOMAIN } from '../../../scales/constants';
import { getDomainPolarity } from '../../../scales/scale_continuous';
import { isLogarithmicScale } from '../../../scales/types';
import { MarkBuffer } from '../../../specs';
import { getDistance } from '../../../utils/commons';
import { BarGeometry, ClippedRanges, isPointGeometry, PointGeometry } from '../../../utils/geometry';
import { GeometryStateStyle, SharedGeometryStateStyle } from '../../../utils/themes/theme';
import { DataSeriesDatum, FilledValues, XYChartSeriesIdentifier } from '../utils/series';
import { DEFAULT_HIGHLIGHT_PADDING } from './constants';

export interface MarkSizeOptions {
  enabled: boolean;
  ratio?: number;
}

/**
 * Returns value of `y1` or `filled.y1` or null by default.
 * Passing a filled key (x, y1, y0) it will return that value or the filled one
 * @internal
 */
export const getYDatumValue = (
  datum: DataSeriesDatum,
  valueName: keyof Omit<FilledValues, 'x'> = 'y1',
  returnFilled = true,
): number | null => {
  const value = datum[valueName];
  if (value !== null || !returnFilled) {
    return value;
  }
  return (datum.filled && datum.filled[valueName]) ?? null;
};

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
export function getClippedRanges(dataset: DataSeriesDatum[], xScale: Scale, xScaleOffset: number): ClippedRanges {
  let firstNonNullX: number | null = null;
  let hasNull = false;
  return dataset.reduce<ClippedRanges>((acc, data) => {
    const xScaled = xScale.scale(data.x);
    if (xScaled === null) {
      return acc;
    }

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
  individualHighlight?: { [key: string]: boolean },
): GeometryStateStyle {
  const { default: defaultStyles, highlighted, unhighlighted } = sharedGeometryStyle;

  if (highlightedLegendItem) {
    const isPartOfHighlightedSeries = seriesIdentifier.key === highlightedLegendItem.seriesIdentifier.key;

    return isPartOfHighlightedSeries ? highlighted : unhighlighted;
  }

  if (individualHighlight) {
    const { hasHighlight, hasGeometryHover } = individualHighlight;
    if (!hasGeometryHover) {
      return highlighted;
    }
    return hasHighlight ? highlighted : unhighlighted;
  }

  return defaultStyles;
}

/** @internal */
export function isPointOnGeometry(
  xCoordinate: number,
  yCoordinate: number,
  indexedGeometry: BarGeometry | PointGeometry,
  buffer: MarkBuffer = DEFAULT_HIGHLIGHT_PADDING,
) {
  const { x, y } = indexedGeometry;
  if (isPointGeometry(indexedGeometry)) {
    const { radius } = indexedGeometry;
    const distance = getDistance(
      {
        x: xCoordinate,
        y: yCoordinate,
      },
      {
        x,
        y,
      },
    );

    const radiusBuffer = typeof buffer === 'number' ? buffer : buffer(radius);

    if (radiusBuffer === Infinity) {
      return distance <= radius + DEFAULT_HIGHLIGHT_PADDING;
    }

    return distance <= radius + radiusBuffer;
  }
  const { width, height } = indexedGeometry;
  return yCoordinate >= y && yCoordinate <= y + height && xCoordinate >= x && xCoordinate <= x + width;
}

/**
 * The default zero baseline for area charts.
 */
const DEFAULT_ZERO_BASELINE = 0;
/**
 * The zero baseline for log scales.
 * We are currently limiting to 1 as min accepted domain for a log scale.
 */
const DEFAULT_LOG_ZERO_BASELINE = LOG_MIN_ABS_DOMAIN;

/** @internal */
export function isYValueDefined(
  yScale: Scale,
  xScale: Scale,
): (datum: DataSeriesDatum, valueName?: keyof Omit<FilledValues, 'x'>) => boolean {
  const isLogScale = isLogarithmicScale(yScale);
  const domainPolarity = getDomainPolarity(yScale.domain);
  return (datum, valueName = 'y1') => {
    const yValue = getYDatumValue(datum, valueName);
    return (
      yValue !== null &&
      !((isLogScale && domainPolarity >= 0 && yValue <= 0) || (domainPolarity < 0 && yValue >= 0)) &&
      xScale.isValueInDomain(datum.x) &&
      yScale.isValueInDomain(yValue)
    );
  };
}

/** @internal */
export function getY1ScaledValueOrThrow(yScale: Scale): (datum: DataSeriesDatum) => number {
  return (datum) => {
    const yValue = getYDatumValue(datum);
    return yScale.scaleOrThrow(yValue);
  };
}

/** @internal */
export function getY0ScaledValueOrThrow(yScale: Scale): (datum: DataSeriesDatum) => number {
  const isLogScale = isLogarithmicScale(yScale);
  const domainPolarity = getDomainPolarity(yScale.domain);

  return ({ y0 }) => {
    if (y0 === null) {
      if (isLogScale) {
        // if all positive domain use 1 as baseline, -1 otherwise
        return yScale.scaleOrThrow(domainPolarity >= 0 ? DEFAULT_LOG_ZERO_BASELINE : -DEFAULT_LOG_ZERO_BASELINE);
      }
      return yScale.scaleOrThrow(DEFAULT_ZERO_BASELINE);
    }
    if (isLogScale) {
      // wrong y0 polarity
      if ((domainPolarity >= 0 && y0 <= 0) || (domainPolarity < 0 && y0 >= 0)) {
        // if all positive domain use 1 as baseline, -1 otherwise
        return yScale.scaleOrThrow(domainPolarity >= 0 ? DEFAULT_LOG_ZERO_BASELINE : -DEFAULT_LOG_ZERO_BASELINE);
      }
      // if negative value, use -1 as max reference, 1 otherwise
      return yScale.scaleOrThrow(y0);
    }
    return yScale.scaleOrThrow(y0);
  };
}
