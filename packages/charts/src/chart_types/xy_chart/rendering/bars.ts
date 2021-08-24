/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import { TextMeasure, withTextMeasure } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, Color, isNil, mergePartial } from '../../../utils/common';
import { Dimensions } from '../../../utils/dimensions';
import { BandedAccessorType, BarGeometry } from '../../../utils/geometry';
import { BarSeriesStyle, DisplayValueStyle } from '../../../utils/themes/theme';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { DataSeries, DataSeriesDatum, XYChartSeriesIdentifier } from '../utils/series';
import { BarStyleAccessor, DisplayValueSpec, LabelOverflowConstraint, StackMode } from '../utils/specs';

const PADDING = 1; // default padding for now
const FONT_SIZE_FACTOR = 0.7; // Take 70% of space for the label text

type BarTuple = {
  barGeometries: BarGeometry[];
  indexedGeometryMap: IndexedGeometryMap;
};

/** @internal */
export function renderBars(
  orderIndex: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  panel: Dimensions,
  color: Color,
  sharedSeriesStyle: BarSeriesStyle,
  displayValueSettings?: DisplayValueSpec,
  styleAccessor?: BarStyleAccessor,
  minBarHeight: number = 0,
  stackMode?: StackMode,
  chartRotation?: number,
): BarTuple {
  const { fontSize, fontFamily } = sharedSeriesStyle.displayValue;
  const initialBarTuple: BarTuple = { barGeometries: [], indexedGeometryMap: new IndexedGeometryMap() } as BarTuple;
  const isLogY = yScale.type === ScaleType.Log;
  const isInvertedY = yScale.isInverted;
  return withTextMeasure((textMeasure) =>
    dataSeries.data.reduce((barTuple: BarTuple, datum) => {
      if (!xScale.isValueInDomain(datum.x)) {
        return barTuple; // don't create a bar if not within the xScale domain
      }
      const { barGeometries, indexedGeometryMap } = barTuple;
      const { y0, y1, initialY1, filled } = datum;
      const isNullishY0 = y0 === 0 || y0 === null;

      let y: number | null;
      if (yScale.type === ScaleType.Log) {
        y = y1 === 0 || y1 === null ? yScale.range[0] : yScale.scale(y1);
      } else {
        y = yScale.scale(y1);
      }

      const y0Scaled = isLogY
        ? isNullishY0
          ? yScale.range[isInvertedY ? 1 : 0]
          : yScale.scale(y0)
        : yScale.scale(y0 === null ? 0 : y0);

      const absMinHeight = Math.abs(minBarHeight);

      // safeguard against null y values
      let height = isNil(y0Scaled) || isNil(y) ? 0 : y0Scaled - y;

      if (isNil(y0Scaled) || isNil(y)) {
        y = 0;
      }

      if (absMinHeight !== undefined && height !== 0 && Math.abs(height) < absMinHeight) {
        height = height < 0 ? -absMinHeight : absMinHeight;
      }

      if (absMinHeight !== undefined && height !== 0 && Math.abs(height) < absMinHeight) {
        const heightDelta = absMinHeight - Math.abs(height);
        y += height < 0 ? heightDelta : -heightDelta;
      }

      const isUpsideDown = height < 0;
      height = Math.abs(height);
      y = isUpsideDown ? y - height : y;

      const xScaled = xScale.scale(datum.x);

      if (xScaled === null) {
        return barTuple;
      }

      const seriesIdentifier: XYChartSeriesIdentifier = {
        key: dataSeries.key,
        specId: dataSeries.specId,
        yAccessor: dataSeries.yAccessor,
        splitAccessors: dataSeries.splitAccessors,
        seriesKeys: dataSeries.seriesKeys,
        smHorizontalAccessorValue: dataSeries.smHorizontalAccessorValue,
        smVerticalAccessorValue: dataSeries.smVerticalAccessorValue,
      };

      const seriesStyle = getBarStyleOverrides(datum, seriesIdentifier, sharedSeriesStyle, styleAccessor);

      const maxPixelWidth = clamp(seriesStyle.rect.widthRatio ?? 1, 0, 1) * xScale.bandwidth;
      const minPixelWidth = clamp(seriesStyle.rect.widthPixel ?? 0, 0, maxPixelWidth);

      const width = clamp(seriesStyle.rect.widthPixel ?? xScale.bandwidth, minPixelWidth, maxPixelWidth);
      const x = xScaled + xScale.bandwidth * orderIndex + xScale.bandwidth / 2 - width / 2;

      const originalY1Value = stackMode === StackMode.Percentage ? (isNil(y1) ? null : y1 - (y0 ?? 0)) : initialY1;
      const formattedDisplayValue = displayValueSettings?.valueFormatter?.(originalY1Value);

      // only show displayValue for even bars if showOverlappingValue
      const displayValueText =
        displayValueSettings?.isAlternatingValueLabel && barGeometries.length % 2 ? undefined : formattedDisplayValue;

      const { displayValueWidth, fixedFontScale } = computeBoxWidth(
        displayValueText ?? '',
        { padding: PADDING, fontSize, fontFamily, textMeasure, width },
        displayValueSettings,
      );

      const isHorizontalRotation = chartRotation == null || chartRotation % 180 === 0;
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
              isValueContainedInElement: displayValueSettings?.isValueContainedInElement ?? false,
            }
          : undefined;

      const barGeometry: BarGeometry = {
        displayValue,
        x,
        y,
        transform: { x: 0, y: 0 },
        width,
        height,
        color,
        value: { x: datum.x, y: originalY1Value, mark: null, accessor: BandedAccessorType.Y1, datum: datum.datum },
        seriesIdentifier,
        seriesStyle,
        panel,
      };
      indexedGeometryMap.set(barGeometry);

      if (y1 !== null && initialY1 !== null && filled?.y1 === undefined) {
        barGeometries.push(barGeometry);
      }

      return barTuple;
    }, initialBarTuple),
  );
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
    textMeasure,
    width,
  }: {
    padding: number;
    fontSize: number | { min: number; max: number };
    fontFamily: string;
    textMeasure: TextMeasure;
    width: number;
  },
  displayValueSettings: DisplayValueSpec | undefined,
): { fixedFontScale: number; displayValueWidth: number } {
  const fixedFontScale = Math.max(typeof fontSize === 'number' ? fontSize : fontSize.min, 1);

  const computedDisplayValueWidth = textMeasure(text || '', padding, fixedFontScale, fontFamily).width;
  if (typeof fontSize !== 'number') {
    return {
      fixedFontScale,
      displayValueWidth: computedDisplayValueWidth,
    };
  }
  return {
    fixedFontScale,
    displayValueWidth:
      displayValueSettings && displayValueSettings.isValueContainedInElement ? width : computedDisplayValueWidth,
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
