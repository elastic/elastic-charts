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

import { LegendItem } from '../../../common/legend';
import { Scale } from '../../../scales';
import { getDomainPolarity } from '../../../scales/scale_continuous';
import { isLogarithmicScale } from '../../../scales/types';
import { MarkBuffer } from '../../../specs';
import { getDistance } from '../../../utils/common';
import { BarGeometry, ClippedRanges, isPointGeometry, PointGeometry } from '../../../utils/geometry';
import { GeometryStateStyle, SharedGeometryStateStyle } from '../../../utils/themes/theme';
import { DataSeriesDatum, XYChartSeriesIdentifier } from '../utils/series';
import { DEFAULT_HIGHLIGHT_PADDING } from './constants';

/** @internal */
export interface MarkSizeOptions {
  enabled: boolean;
  ratio?: number;
}

/**
 * @internal
 */
export function getYDatumValueFn(valueName: 'y1' | 'y0' = 'y1') {
  return (datum: DataSeriesDatum): number => {
    const value = datum[valueName];
    if (!isNaN(value)) {
      return value;
    }
    return datum.metadata[valueName].isFilled ? datum.metadata[valueName].validated : NaN;
  };
}

/**
 *
 * @internal
 */
export function isDatumFilled({ metadata }: DataSeriesDatum) {
  return metadata.x.isFilled || metadata.y1.isFilled || metadata.y0.isFilled || metadata.mark.isFilled;
}

/**
 * Gets clipped ranges that have been fitted to values
 * @param dataset
 * @param xScale
 * @param xScaleOffset
 * @internal
 */
export function getClippedRanges(dataset: DataSeriesDatum[], xScale: Scale, xScaleOffset: number): ClippedRanges {
  let firstNonFilledOrNan: number | null = null;
  let hasNull = false;

  const isCompletelyFilled = dataset.every((datum) => isDatumFilled(datum));

  if (isCompletelyFilled) return [[xScale.range[0], xScale.range[1]]];

  return dataset.reduce<ClippedRanges>((acc, data) => {
    const xScaled = xScale.scale(data.x);
    if (xScaled === null) {
      return acc;
    }

    const xValue = xScaled - xScaleOffset + xScale.bandwidth / 2;

    if (isDatumFilled(data) || !isFinite(data.metadata.y1.validated)) {
      const endXValue = xScale.range[1] - xScale.bandwidth * (2 / 3);
      if (firstNonFilledOrNan !== null && xValue === endXValue) {
        acc.push([firstNonFilledOrNan, xValue]);
      }
      hasNull = true;
    } else {
      if (hasNull) {
        if (firstNonFilledOrNan !== null) {
          acc.push([firstNonFilledOrNan, xValue]);
        } else {
          acc.push([0, xValue]);
        }
        hasNull = false;
      }

      firstNonFilledOrNan = xValue;
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
    const isPartOfHighlightedSeries = highlightedLegendItem.seriesIdentifiers.some(
      ({ key }) => key === seriesIdentifier.key,
    );

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

/** @internal */
export type YDefinedFn = (datum: DataSeriesDatum, getValueAccessor: (d: DataSeriesDatum) => number) => boolean;

/** @internal */
export function isYValueDefinedFn(yScale: Scale, xScale: Scale): YDefinedFn {
  const isLogScale = isLogarithmicScale(yScale);
  const domainPolarity = getDomainPolarity(yScale.domain);
  return (datum, getValueAccessor) => {
    const yValue = getValueAccessor(datum);
    return (
      isFinite(yValue) &&
      !(isLogScale && yValue === 0) &&
      !((isLogScale && domainPolarity >= 0 && yValue <= 0) || (domainPolarity < 0 && yValue >= 0)) &&
      xScale.isValueInDomain(datum.x)
    );
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
  const diff = Math.abs(y1 - y0);
  return diff <= CHROME_PINCH_BUG_EPSILON ? 0.5 : 0;
}

/** @internal */
export function getY1ScaledValue(yScale: Scale): (datum: DataSeriesDatum) => number {
  const datumAccessor = getYDatumValueFn();
  const scaleY0Value = getY0ScaledValue(yScale);
  return (datum) => {
    const y1Value = yScale.scale(datumAccessor(datum));
    if (isNaN(y1Value)) {
      return NaN;
    }
    const y0Value = scaleY0Value(datum);
    return y1Value - chromeRenderBugBuffer(y1Value, y0Value);
  };
}

/** @internal */
export function getY0ScaledValue(yScale: Scale): (datum: DataSeriesDatum) => number {
  const isLogScale = isLogarithmicScale(yScale);
  const domainPolarity = getDomainPolarity(yScale.domain);
  const logBaseline = domainPolarity >= 0 ? Math.min(...yScale.domain) : Math.max(...yScale.domain);

  return ({ y0 }) => {
    if (isNaN(y0)) {
      if (isLogScale) {
        // if all positive domain use 1 as baseline, -1 otherwise
        return yScale.scale(logBaseline);
      }
      return yScale.scale(DEFAULT_ZERO_BASELINE);
    }
    if (isLogScale) {
      // wrong y0 polarity
      if ((domainPolarity >= 0 && y0 <= 0) || (domainPolarity < 0 && y0 >= 0)) {
        // if all positive domain use 1 as baseline, -1 otherwise
        return yScale.scale(logBaseline);
      }
      // if negative value, use -1 as max reference, 1 otherwise
      return yScale.scale(y0);
    }
    return yScale.scale(y0);
  };
}
