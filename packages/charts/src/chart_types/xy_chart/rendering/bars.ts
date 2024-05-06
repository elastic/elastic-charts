/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getDatumYValue } from './points';
import { getY0ScaledValueFn, getY1ScaledValueFn } from './utils';
import { Color } from '../../../common/colors';
import { ScaleBand, ScaleContinuous } from '../../../scales';
import { TextMeasure } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, mergePartial } from '../../../utils/common';
import { Dimensions } from '../../../utils/dimensions';
import { BandedAccessorType, BarGeometry } from '../../../utils/geometry';
import { BarSeriesStyle, DisplayValueStyle } from '../../../utils/themes/theme';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import {
  DataSeries,
  DataSeriesDatum,
  getSeriesIdentifierFromDataSeries,
  XYChartSeriesIdentifier,
} from '../utils/series';
import { BarStyleAccessor, DisplayValueSpec, LabelOverflowConstraint, StackMode } from '../utils/specs';

const PADDING = 1; // default padding for now
const FONT_SIZE_FACTOR = 0.7; // Take 70% of space for the label text

type BarTuple = {
  barGeometries: BarGeometry[];
  indexedGeometryMap: IndexedGeometryMap;
};

/** @internal */
export function renderBars(
  measureText: TextMeasure,
  orderIndex: number,
  dataSeries: DataSeries,
  xScale: ScaleContinuous | ScaleBand,
  yScale: ScaleContinuous,
  panel: Dimensions,
  chartRotation: number,
  minBarHeight: number,
  color: Color,
  isBandedSpec: boolean,
  sharedSeriesStyle: BarSeriesStyle,
  displayValueSettings?: DisplayValueSpec,
  styleAccessor?: BarStyleAccessor,
  stackMode?: StackMode,
): BarTuple {
  const { fontSize, fontFamily } = sharedSeriesStyle.displayValue;
  const initialBarTuple: BarTuple = { barGeometries: [], indexedGeometryMap: new IndexedGeometryMap() } as BarTuple;
  const y1Fn = getY1ScaledValueFn(yScale);
  const y0Fn = getY0ScaledValueFn(yScale);

  return dataSeries.data.reduce((barTuple: BarTuple, datum) => {
    const xScaled = xScale.scale(datum.x);
    if (!xScale.isValueInDomain(datum.x) || Number.isNaN(xScaled)) {
      return barTuple; // don't create a bar if not within the xScale domain
    }
    const { barGeometries, indexedGeometryMap } = barTuple;
    const { y1, initialY1, filled } = datum;

    const y1Scaled = y1Fn(datum);
    const y0Scaled = y0Fn(datum);

    // orientation independent height
    const yDiff = Math.abs(y1Scaled - y0Scaled);
    // amount required to reach the minBarHeight requested
    const addedMinBarHeight = yDiff === 0 || yDiff >= minBarHeight ? 0 : minBarHeight - yDiff;

    // the y coordinate in screen-space.
    const yScreenSpaceCoord =
      Math.min(y1Scaled, y0Scaled) +
      // adding half of the required minBarHeight if banded bar chart
      // and reduce the y coordinate if the Y value is positive to render correctly the increased bar height
      (isBandedSpec ? -addedMinBarHeight / 2 : -addedMinBarHeight * ((y1 ?? 0) >= 0 ? 1 : 0));
    // the actual height of the bar
    const height = yDiff + addedMinBarHeight;

    const seriesIdentifier: XYChartSeriesIdentifier = getSeriesIdentifierFromDataSeries(dataSeries);
    const seriesStyle = getBarStyleOverrides(datum, seriesIdentifier, sharedSeriesStyle, styleAccessor);

    const maxPixelWidth = clamp(seriesStyle.rect.widthRatio ?? 1, 0, 1) * xScale.bandwidth;
    const minPixelWidth = clamp(seriesStyle.rect.widthPixel ?? 0, 0, maxPixelWidth);

    const width = clamp(seriesStyle.rect.widthPixel ?? xScale.bandwidth, minPixelWidth, maxPixelWidth);
    const x = xScaled + xScale.bandwidth * orderIndex + xScale.bandwidth / 2 - width / 2;

    const y1Value = getDatumYValue(datum, false, isBandedSpec, stackMode);
    const formattedDisplayValue = displayValueSettings?.valueFormatter?.(y1Value);

    // only show displayValue for even bars if showOverlappingValue
    const displayValueText =
      displayValueSettings?.isAlternatingValueLabel && barGeometries.length % 2 ? undefined : formattedDisplayValue;

    const { displayValueWidth, fixedFontScale } = computeBoxWidth(displayValueText ?? '', {
      padding: PADDING,
      fontSize,
      fontFamily,
      measureText,
    });

    const isHorizontalRotation = chartRotation % 180 === 0;
    // Pick the right side of the label's box to use as factor reference
    const referenceWidth = Math.max(isHorizontalRotation ? displayValueWidth : fixedFontScale, 1);

    const textScalingFactor = getFinalFontScalingFactor(
      (width * FONT_SIZE_FACTOR) / referenceWidth,
      fixedFontScale,
      fontSize,
    );
    const overflowConstraints: Set<LabelOverflowConstraint> = new Set(
      displayValueSettings?.overflowConstraints ?? [
        LabelOverflowConstraint.ChartEdges,
        LabelOverflowConstraint.BarGeometry,
      ],
    );

    // Based on rotation scale the width of the text box
    const bboxWidthFactor = isHorizontalRotation ? textScalingFactor : 1;

    const displayValue: BarGeometry['displayValue'] | undefined =
      displayValueText && displayValueSettings?.showValueLabel
        ? {
            fontScale: textScalingFactor,
            fontSize: fixedFontScale,
            text: displayValueText,
            width: bboxWidthFactor * displayValueWidth,
            height: textScalingFactor * fixedFontScale,
            overflowConstraints,
          }
        : undefined;

    const barGeometry: BarGeometry = {
      displayValue,
      x,
      y: yScreenSpaceCoord,
      transform: { x: 0, y: 0 },
      width,
      height,
      color,
      value: { x: datum.x, y: y1Value, mark: null, accessor: BandedAccessorType.Y1, datum: datum.datum },
      seriesIdentifier,
      seriesStyle,
      panel,
    };

    if (isBandedSpec) {
      // index also the Y0 value with the same geometry
      indexedGeometryMap.set({
        ...barGeometry,
        value: {
          x: datum.x,
          y: getDatumYValue(datum, true, isBandedSpec, stackMode),
          mark: null,
          accessor: BandedAccessorType.Y0,
          datum: datum.datum,
        },
      });
    }

    indexedGeometryMap.set(barGeometry);

    if (y1 !== null && initialY1 !== null && filled?.y1 === undefined) {
      barGeometries.push(barGeometry);
    }

    return barTuple;
  }, initialBarTuple);
}

/**
 * Workout the text box size and fixedFontSize based on a collection of options
 * @internal
 */
function computeBoxWidth(
  text: string,
  {
    padding,
    fontSize,
    fontFamily,
    measureText,
  }: {
    padding: number;
    fontSize: number | { min: number; max: number };
    fontFamily: string;
    measureText: TextMeasure;
  },
): { fixedFontScale: number; displayValueWidth: number } {
  const fixedFontScale = Math.max(typeof fontSize === 'number' ? fontSize : fontSize.min, 1);

  const computedDisplayValueWidth = measureText(
    text,
    { fontFamily, fontWeight: 'normal', fontStyle: 'normal', fontVariant: 'normal' },
    fixedFontScale,
  ).width;
  if (typeof fontSize !== 'number') {
    return {
      fixedFontScale,
      displayValueWidth: computedDisplayValueWidth + padding,
    };
  }
  return {
    fixedFontScale,
    displayValueWidth: computedDisplayValueWidth,
  };
}

/**
 * Returns a safe scaling factor for label text for fixed or range size inputs
 * @internal
 */
function getFinalFontScalingFactor(
  scale: number,
  fixedFontSize: number,
  limits: DisplayValueStyle['fontSize'],
): number {
  if (typeof limits === 'number') {
    // it's a fixed size, so it's always ok
    return 1;
  }
  const finalFontSize = scale * fixedFontSize;
  if (finalFontSize > limits.max) {
    return limits.max / fixedFontSize;
  }
  if (finalFontSize < limits.min) {
    // it's technically 1, but keep it generic in case the fixedFontSize changes
    return limits.min / fixedFontSize;
  }
  return scale;
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
    return { ...seriesStyle, rect: { ...seriesStyle.rect, fill: styleOverride } };
  }

  return mergePartial(seriesStyle, styleOverride);
}
