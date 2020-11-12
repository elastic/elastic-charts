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

import { area, line } from 'd3-shape';

import { LegendItem } from '../../../commons/legend';
import { Scale } from '../../../scales';
import { LOG_MIN_ABS_DOMAIN, ScaleType } from '../../../scales/constants';
import { getDomainPolarity } from '../../../scales/scale_continuous';
import { isLogarithmicScale } from '../../../scales/types';
import { MarkBuffer, StackMode } from '../../../specs';
import { CanvasTextBBoxCalculator } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { mergePartial, Color, getDistance } from '../../../utils/commons';
import { CurveType, getCurveFactory } from '../../../utils/curves';
import {
  PointGeometry,
  BarGeometry,
  AreaGeometry,
  LineGeometry,
  isPointGeometry,
  ClippedRanges,
  BandedAccessorType,
  BubbleGeometry,
} from '../../../utils/geometry';
import {
  AreaSeriesStyle,
  LineSeriesStyle,
  PointStyle,
  SharedGeometryStateStyle,
  BarSeriesStyle,
  GeometryStateStyle,
  LineStyle,
  BubbleSeriesStyle,
} from '../../../utils/themes/theme';
import { IndexedGeometryMap, GeometryType } from '../utils/indexed_geometry_map';
import { DataSeriesDatum, DataSeries, XYChartSeriesIdentifier, FilledValues } from '../utils/series';
import { DisplayValueSpec, PointStyleAccessor, BarStyleAccessor } from '../utils/specs';
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
  return datum.filled?.[valueName] ?? null;
};

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

/** @internal */
export function getBarStyleOverrides(
  datum: DataSeriesDatum,
  seriesIdentifier: XYChartSeriesIdentifier,
  seriesStyle: BarSeriesStyle,
  styleAccessor?: BarStyleAccessor,
): BarSeriesStyle {
  const styleOverride = styleAccessor && styleAccessor(datum, seriesIdentifier);

  if (!styleOverride) {
    return seriesStyle;
  }

  if (typeof styleOverride === 'string') {
    return {
      ...seriesStyle,
      rect: {
        ...seriesStyle.rect,
        fill: styleOverride,
      },
    };
  }

  return mergePartial(seriesStyle, styleOverride, {
    mergeOptionalPartialValues: true,
  });
}

type GetRadiusFnReturn = (mark: number | null, defaultRadius?: number) => number;

/**
 * Get radius function form ratio and min/max mark size
 *
 * @todo add continuous/non-stepped function
 *
 * @param  {Datum[]} radii
 * @param  {number} lineWidth
 * @param  {number=50} markSizeRatio - 0 to 100
 * @internal
 */
export function getRadiusFn(data: DataSeriesDatum[], lineWidth: number, markSizeRatio: number = 50): GetRadiusFnReturn {
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

function renderPoints(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  color: Color,
  lineStyle: LineStyle,
  hasY0Accessors: boolean,
  markSizeOptions: MarkSizeOptions,
  styleAccessor?: PointStyleAccessor,
  spatial = false,
  stackMode?: StackMode,
): {
  pointGeometries: PointGeometry[];
  indexedGeometryMap: IndexedGeometryMap;
} {
  const indexedGeometryMap = new IndexedGeometryMap();
  const getRadius = markSizeOptions.enabled
    ? getRadiusFn(dataSeries.data, lineStyle.strokeWidth, markSizeOptions.ratio)
    : () => 0;
  const geometryType = spatial ? GeometryType.spatial : GeometryType.linear;

  const y1Fn = getY1ScaledValueOrThrow(yScale);
  const y0Fn = getY0ScaledValueOrThrow(yScale);
  const yDefined = isYValueDefined(yScale, xScale);

  const pointGeometries = dataSeries.data.reduce((acc, datum) => {
    const { x: xValue, mark } = datum;
    // don't create the point if not within the xScale domain
    if (!xScale.isValueInDomain(xValue)) {
      return acc;
    }
    // don't create the point if it that point was filled
    if (isDatumFilled(datum)) {
      return acc;
    }
    const x = xScale.scale(xValue);

    if (x === null) {
      return acc;
    }

    const points: PointGeometry[] = [];
    const yDatumKeyNames: Array<keyof Omit<FilledValues, 'x'>> = hasY0Accessors ? ['y0', 'y1'] : ['y1'];

    yDatumKeyNames.forEach((yDatumKeyName, index) => {
      // skip rendering point if y1 is null
      const radius = getRadius(mark);
      let y: number | null;
      try {
        y = yDatumKeyName === 'y1' ? y1Fn(datum) : y0Fn(datum);
        if (y === null) {
          return;
        }
      } catch {
        return;
      }

      const originalY = getDatumYValue(datum, index === 0, hasY0Accessors, stackMode);
      const seriesIdentifier: XYChartSeriesIdentifier = {
        key: dataSeries.key,
        specId: dataSeries.specId,
        yAccessor: dataSeries.yAccessor,
        splitAccessors: dataSeries.splitAccessors,
        seriesKeys: dataSeries.seriesKeys,
      };
      const styleOverrides = getPointStyleOverrides(datum, seriesIdentifier, styleAccessor);
      const pointGeometry: PointGeometry = {
        radius,
        x,
        y,
        color,
        value: {
          x: xValue,
          y: originalY,
          mark,
          accessor: hasY0Accessors && index === 0 ? BandedAccessorType.Y0 : BandedAccessorType.Y1,
          datum: datum.datum,
        },
        transform: {
          x: shift,
          y: 0,
        },
        seriesIdentifier,
        styleOverrides,
      };
      indexedGeometryMap.set(pointGeometry, geometryType);
      // use the geometry only if the yDatum in contained in the current yScale domain
      if (yDefined(datum, yDatumKeyName)) {
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

/**
 * Get the original/initial Y value from the datum
 * @param datum a DataSeriesDatum
 * @param lookingForY0 if we are interested in the y0 value, false for y1
 * @param isBandChart if the chart is a band chart
 * @param stackMode an optional stack mode
 */
function getDatumYValue(
  { y1, y0, initialY1, initialY0 }: DataSeriesDatum,
  lookingForY0: boolean,
  isBandChart: boolean,
  stackMode?: StackMode,
) {
  if (isBandChart) {
    return stackMode === StackMode.Percentage
      ? // on band stacked charts in percentage mode, the values I'm looking for are the percentage value
        // that are already computed and available on y0 and y1
        lookingForY0
        ? y0
        : y1
      : // in all other cases for band charts, I want to get back the original/initial value of y0 and y1
      // not the computed value
      lookingForY0
      ? initialY0
      : initialY1;
  }
  // if not a band chart get use the original/initial value in every case except for stack as percentage
  // in this case, we should take the difference between the bottom position of the bar and the top position
  // of the bar
  return stackMode === StackMode.Percentage ? (y1 ?? 0) - (y0 ?? 0) : initialY1;
}

/** @internal */
export function renderBars(
  orderIndex: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  color: Color,
  sharedSeriesStyle: BarSeriesStyle,
  displayValueSettings?: DisplayValueSpec,
  styleAccessor?: BarStyleAccessor,
  minBarHeight?: number,
  stackMode?: StackMode,
): {
  barGeometries: BarGeometry[];
  indexedGeometryMap: IndexedGeometryMap;
} {
  const indexedGeometryMap = new IndexedGeometryMap();
  const barGeometries: BarGeometry[] = [];

  const bboxCalculator = new CanvasTextBBoxCalculator();

  // default padding to 1 for now
  const padding = 1;
  const { fontSize, fontFamily } = sharedSeriesStyle.displayValue;
  const absMinHeight = minBarHeight && Math.abs(minBarHeight);

  dataSeries.data.forEach((datum) => {
    const { y0, y1, initialY1, filled } = datum;
    // don't create a bar if the initialY1 value is null.
    if (y1 === null || initialY1 === null || (filled && filled.y1 !== undefined)) {
      return;
    }
    // don't create a bar if not within the xScale domain
    if (!xScale.isValueInDomain(datum.x)) {
      return;
    }

    let y: number | null = 0;
    let y0Scaled;
    if (yScale.type === ScaleType.Log) {
      y = y1 === 0 || y1 === null ? yScale.range[0] : yScale.scale(y1);
      if (yScale.isInverted) {
        y0Scaled = y0 === 0 || y0 === null ? yScale.range[1] : yScale.scale(y0);
      } else {
        y0Scaled = y0 === 0 || y0 === null ? yScale.range[0] : yScale.scale(y0);
      }
    } else {
      y = yScale.scale(y1);
      if (yScale.isInverted) {
        // use always zero as baseline if y0 is null
        y0Scaled = y0 === null ? yScale.scale(0) : yScale.scale(y0);
      } else {
        y0Scaled = y0 === null ? yScale.scale(0) : yScale.scale(y0);
      }
    }

    if (y === null || y0Scaled === null) {
      return;
    }

    let height = y0Scaled - y;

    // handle minBarHeight adjustment
    if (absMinHeight !== undefined && height !== 0 && Math.abs(height) < absMinHeight) {
      const heightDelta = absMinHeight - Math.abs(height);
      if (height < 0) {
        height = -absMinHeight;
        y += heightDelta;
      } else {
        height = absMinHeight;
        y -= heightDelta;
      }
    }

    const xScaled = xScale.scale(datum.x);

    if (xScaled === null) {
      return;
    }

    const x = xScaled + xScale.bandwidth * orderIndex;
    const width = xScale.bandwidth;
    const originalY1Value = stackMode === StackMode.Percentage ? y1 - (y0 ?? 0) : initialY1;
    const formattedDisplayValue =
      displayValueSettings && displayValueSettings.valueFormatter
        ? displayValueSettings.valueFormatter(originalY1Value)
        : undefined;

    // only show displayValue for even bars if showOverlappingValue
    const displayValueText =
      displayValueSettings && displayValueSettings.isAlternatingValueLabel
        ? barGeometries.length % 2 === 0
          ? formattedDisplayValue
          : undefined
        : formattedDisplayValue;

    const computedDisplayValueWidth = bboxCalculator.compute(displayValueText || '', padding, fontSize, fontFamily)
      .width;
    const displayValueWidth =
      displayValueSettings && displayValueSettings.isValueContainedInElement ? width : computedDisplayValueWidth;

    const hideClippedValue = displayValueSettings ? displayValueSettings.hideClippedValue : undefined;

    const displayValue =
      displayValueSettings && displayValueSettings.showValueLabel
        ? {
            text: displayValueText,
            width: displayValueWidth,
            height: fontSize,
            hideClippedValue,
            isValueContainedInElement: displayValueSettings.isValueContainedInElement,
          }
        : undefined;

    const seriesIdentifier: XYChartSeriesIdentifier = {
      key: dataSeries.key,
      specId: dataSeries.specId,
      yAccessor: dataSeries.yAccessor,
      splitAccessors: dataSeries.splitAccessors,
      seriesKeys: dataSeries.seriesKeys,
    };

    const seriesStyle = getBarStyleOverrides(datum, seriesIdentifier, sharedSeriesStyle, styleAccessor);

    const barGeometry: BarGeometry = {
      displayValue,
      x,
      y, // top most value
      width,
      height,
      color,
      value: {
        x: datum.x,
        y: originalY1Value,
        mark: null,
        accessor: BandedAccessorType.Y1,
        datum: datum.datum,
      },
      seriesIdentifier,
      seriesStyle,
    };
    indexedGeometryMap.set(barGeometry);
    barGeometries.push(barGeometry);
  });

  bboxCalculator.destroy();

  return {
    barGeometries,
    indexedGeometryMap,
  };
}

/** @internal */
export function renderLine(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
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
  const y1Fn = getY1ScaledValueOrThrow(yScale);
  const definedFn = isYValueDefined(yScale, xScale);

  const pathGenerator = line<DataSeriesDatum>()
    .x(({ x }) => xScale.scaleOrThrow(x) - xScaleOffset)
    .y(y1Fn)
    .defined((datum) => {
      return definedFn(datum);
    })
    .curve(getCurveFactory(curve));

  const { pointGeometries, indexedGeometryMap } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    color,
    seriesStyle.line,
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

/** @internal */
export function renderBubble(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  color: Color,
  hasY0Accessors: boolean,
  seriesStyle: BubbleSeriesStyle,
  markSizeOptions: MarkSizeOptions,
  isMixedChart: boolean,
  pointStyleAccessor?: PointStyleAccessor,
): {
  bubbleGeometry: BubbleGeometry;
  indexedGeometryMap: IndexedGeometryMap;
} {
  const { pointGeometries, indexedGeometryMap } = renderPoints(
    shift,
    dataSeries,
    xScale,
    yScale,
    color,
    seriesStyle.point,
    hasY0Accessors,
    markSizeOptions,
    pointStyleAccessor,
    !isMixedChart,
  );

  const bubbleGeometry = {
    points: pointGeometries,
    color,
    seriesIdentifier: {
      key: dataSeries.key,
      specId: dataSeries.specId,
      yAccessor: dataSeries.yAccessor,
      splitAccessors: dataSeries.splitAccessors,
      seriesKeys: dataSeries.seriesKeys,
    },
    seriesPointStyle: seriesStyle.point,
  };
  return {
    bubbleGeometry,
    indexedGeometryMap,
  };
}

/** @internal */

export function renderArea(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  color: Color,
  curve: CurveType,
  hasY0Accessors: boolean,
  xScaleOffset: number,
  seriesStyle: AreaSeriesStyle,
  markSizeOptions: MarkSizeOptions,
  isStacked = false,
  pointStyleAccessor?: PointStyleAccessor,
  hasFit?: boolean,
  stackMode?: StackMode,
): {
  areaGeometry: AreaGeometry;
  indexedGeometryMap: IndexedGeometryMap;
} {
  const y1Fn = getY1ScaledValueOrThrow(yScale);
  const y0Fn = getY0ScaledValueOrThrow(yScale);
  const definedFn = isYValueDefined(yScale, xScale);
  const pathGenerator = area<DataSeriesDatum>()
    .x(({ x }) => xScale.scaleOrThrow(x) - xScaleOffset)
    .y1(y1Fn)
    .y0(y0Fn)
    .defined((datum) => {
      return definedFn(datum) && (hasY0Accessors ? definedFn(datum, 'y0') : true);
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
    color,
    seriesStyle.line,
    hasY0Accessors,
    markSizeOptions,
    pointStyleAccessor,
    false,
    stackMode,
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
  highlightedLegendItem: LegendItem | null,
  sharedGeometryStyle: SharedGeometryStateStyle,
  individualHighlight?: { [key: string]: boolean },
): GeometryStateStyle {
  const { default: defaultStyles, highlighted, unhighlighted } = sharedGeometryStyle;

  if (highlightedLegendItem != null) {
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
    const { radius, transform } = indexedGeometry;
    const distance = getDistance(
      {
        x: xCoordinate,
        y: yCoordinate,
      },
      {
        x: x + transform.x,
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
