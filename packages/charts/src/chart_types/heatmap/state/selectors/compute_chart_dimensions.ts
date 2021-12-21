/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { max as d3Max } from 'd3-array';

import { Box, measureText, TextMeasure } from '../../../../common/text_utils';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { Dimensions, innerPad, outerPad, verticalPad } from '../../../../utils/dimensions';
import { isHorizontalLegend } from '../../../../utils/legend';
import { AxisStyle, HeatmapStyle } from '../../../../utils/themes/theme';
import { HeatmapCellDatum } from '../../layout/viewmodel/viewmodel';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';
import { getXAxisRightOverflow } from './get_x_axis_right_overflow';

/** @internal */
export interface HeatmapTable {
  table: Array<HeatmapCellDatum>;
  yValues: Array<string | number>;
  xValues: Array<string | number>;
  xNumericExtent: [number, number];
  extent: [number, number];
}

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export type ChartElementSizes = {
  yAxis: Dimensions;
  xAxis: Dimensions;
  grid: Dimensions;
  fullHeatmapHeight: number;
  rowHeight: number;
  visibleNumberOfRows: number;
};
/**
 * Returns grid and axes sizes and positions.
 * @internal
 */
export const computeChartElementSizesSelector = createCustomCachedSelector(
  [
    getParentDimension,
    getLegendSizeSelector,
    getHeatmapTableSelector,
    getChartThemeSelector,
    getXAxisRightOverflow,
    getHeatmapSpecSelector,
  ],
  (
    container,
    legendSize,

    { yValues },
    { heatmap, axes: { axisTitle: axisTitleStyle } },
    rightOverflow,
    { xAxisTitle, yAxisTitle },
  ): ChartElementSizes => {
    const textMeasurer = document.createElement('canvas');
    const textMeasurerCtx = textMeasurer.getContext('2d');
    if (!textMeasurerCtx) {
      return {
        grid: { width: 0, height: 0, left: 0, top: 0 },
        xAxis: { width: 0, height: 0, left: 0, top: 0 },
        yAxis: { width: 0, height: 0, left: 0, top: 0 },
        fullHeatmapHeight: 0,
        rowHeight: 0,
        visibleNumberOfRows: 0,
      };
    }
    const textMeasure = measureText(textMeasurerCtx);

    const isLegendHorizontal = isHorizontalLegend(legendSize.position);
    const legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
    const legendHeight = isLegendHorizontal ? heatmap.maxLegendHeight ?? legendSize.height + legendSize.margin * 2 : 0;

    const yAxisTitleHorizontalSize = getTextSizeDimension(yAxisTitle, axisTitleStyle, textMeasure, 'height');
    const yAxisWidth = getYAxisHorizontalUsedSpace(yValues, heatmap.yAxisLabel, textMeasure);

    const xAxisTitleVerticalSize = getTextSizeDimension(xAxisTitle, axisTitleStyle, textMeasure, 'height');
    const xAxisHeight = heatmap.xAxisLabel.visible
      ? heatmap.xAxisLabel.fontSize + verticalPad(heatmap.xAxisLabel.padding)
      : 0;

    const availableHeightForGrid = container.height - xAxisTitleVerticalSize - xAxisHeight - legendHeight;

    const rowHeight = getGridCellHeight(yValues.length, heatmap.grid, availableHeightForGrid);
    const fullHeatmapHeight = rowHeight * yValues.length;

    const visibleNumberOfRows =
      rowHeight > 0 && fullHeatmapHeight > availableHeightForGrid
        ? Math.floor(availableHeightForGrid / rowHeight)
        : yValues.length;

    const grid: Dimensions = {
      width: container.width - yAxisWidth - yAxisTitleHorizontalSize - rightOverflow - legendWidth,
      height: visibleNumberOfRows * rowHeight,
      left: container.left + yAxisTitleHorizontalSize + yAxisWidth,
      top: container.top,
    };

    const yAxis: Dimensions = {
      width: yAxisWidth,
      height: grid.height,
      top: grid.top,
      left: grid.left - yAxisWidth,
    };

    const xAxis: Dimensions = {
      width: grid.width,
      height: xAxisHeight,
      top: grid.top + grid.height,
      left: grid.left,
    };

    return { grid, yAxis, xAxis, visibleNumberOfRows, fullHeatmapHeight, rowHeight };
  },
);

function getYAxisHorizontalUsedSpace(
  yValues: HeatmapTable['yValues'],
  yAxisLabel: HeatmapStyle['yAxisLabel'],
  textMeasure: TextMeasure,
) {
  if (!yAxisLabel.visible) {
    return 0;
  }

  const labels = yValues.map<Box & { value: string | number }>((value) => {
    return {
      text: `${value}`,
      value,
      isValue: false,
      ...yAxisLabel,
    };
  });
  // account for the space required to show the longest Y axis label
  const measuredLabels = textMeasure(yAxisLabel.fontSize, labels);

  const longestLabelWidth = d3Max(measuredLabels, (label) => label.width) ?? 0;
  const labelsWidth =
    yAxisLabel.width === 'auto'
      ? longestLabelWidth
      : typeof yAxisLabel.width === 'number'
      ? yAxisLabel.width
      : Math.max(longestLabelWidth, yAxisLabel.width.max);
  const labelPadding =
    typeof yAxisLabel.padding === 'number'
      ? yAxisLabel.padding * 2
      : (yAxisLabel.padding.left ?? 0) + (yAxisLabel.padding.right ?? 0);

  return labelsWidth + labelPadding;
}

function getTextSizeDimension(
  text: string,
  style: AxisStyle['axisTitle'],
  textMeasure: TextMeasure,
  param: 'height' | 'width',
): number {
  if (!style.visible || text === '') {
    return 0;
  }
  const textPadding = innerPad(style.padding) + outerPad(style.padding);
  if (param === 'height') {
    return style.fontSize + textPadding;
  }

  const textBox = textMeasure(style.fontSize, [
    {
      fontVariant: 'normal',
      fontWeight: 'bold',
      fontStyle: style.fontStyle ?? 'normal',
      fontFamily: style.fontFamily,
      textColor: style.fill,
      text,
    },
  ]);
  return textBox.length === 1 ? textBox[0].width + textPadding : 0;
}

function getGridCellHeight(rows: number, grid: HeatmapStyle['grid'], height: number): number {
  if (rows === 0) {
    return height; // TODO check if this can be just 0
  }
  const stretchedHeight = height / rows;

  if (stretchedHeight < grid.cellHeight.min) {
    return grid.cellHeight.min;
  }
  if (grid.cellHeight.max !== 'fill' && stretchedHeight > grid.cellHeight.max) {
    return grid.cellHeight.max;
  }

  return stretchedHeight;
}
