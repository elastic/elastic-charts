/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { TextMeasure, withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { Dimensions, horizontalPad, innerPad, outerPad, verticalPad } from '../../../../utils/dimensions';
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
    return withTextMeasure((textMeasure) => {
      const isLegendHorizontal = isHorizontalLegend(legendSize.position);
      const legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
      const legendHeight = isLegendHorizontal
        ? heatmap.maxLegendHeight ?? legendSize.height + legendSize.margin * 2
        : 0;

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
    });
  },
);

function getYAxisHorizontalUsedSpace(
  yValues: HeatmapTable['yValues'],
  style: HeatmapStyle['yAxisLabel'],
  textMeasure: TextMeasure,
) {
  if (!style.visible) {
    return 0;
  }
  // account for the space required to show the longest Y axis label
  const longestLabelWidth = yValues.reduce<number>((acc, value) => {
    const { width } = textMeasure(`${value}`, style, style.fontSize);
    return Math.max(width, acc);
  }, 0);

  const labelsWidth =
    style.width === 'auto'
      ? longestLabelWidth
      : typeof style.width === 'number'
      ? style.width
      : Math.max(longestLabelWidth, style.width.max);

  return labelsWidth + horizontalPad(style.padding);
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

  const textBox = textMeasure(
    text,
    {
      ...style,
      fontVariant: 'normal',
      fontWeight: 'bold',
      fontStyle: style.fontStyle ?? 'normal',
    },
    style.fontSize,
  );
  return textBox.width + textPadding;
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
