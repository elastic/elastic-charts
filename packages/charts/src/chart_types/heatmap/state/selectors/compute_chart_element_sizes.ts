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
import { Dimensions } from '../../../../utils/dimensions';
import { getGridCellHeight } from '../utils/axis';
import { computeAxesSizesSelector } from './compute_axes_sizes';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export type ChartElementSizes = {
  yAxis: Dimensions;
  xAxis: Dimensions;
  fullHeatmapHeight: number;
  rowHeight: number;
  visibleNumberOfRows: number;
  xAxisTickCadence: number;
  xLabelRotation: number;
};

/**
 * Returns grid and axes sizes and positions.
 * @internal
 */
export const computeChartElementSizesSelector = createCustomCachedSelector(
  [
    getParentDimension,
    computeAxesSizesSelector,
    getHeatmapTableSelector,
    getChartThemeSelector,
    getHeatmapSpecSelector,
  ],
  (parentDimensions, axesSizes, { yValues }, { heatmap }): ChartElementSizes => {
    const availableHeightForGrid =
      parentDimensions.height -
      axesSizes.xAxisTitleVerticalSize -
      axesSizes.xAxisPanelTitleVerticalSize -
      axesSizes.xAxis.height -
      axesSizes.legendHeight -
      heatmap.grid.stroke.width / 2;

    const rowHeight = getGridCellHeight(yValues.length, heatmap.grid, availableHeightForGrid);
    const fullHeatmapHeight = rowHeight * yValues.length;

    const visibleNumberOfRows =
      rowHeight > 0 && fullHeatmapHeight > availableHeightForGrid
        ? Math.floor(availableHeightForGrid / rowHeight)
        : yValues.length;

    const grid: Dimensions = {
      width: axesSizes.xAxis.width,
      height: visibleNumberOfRows * rowHeight - heatmap.grid.stroke.width / 2,
      left: parentDimensions.left + axesSizes.xAxis.left,
      top: parentDimensions.top + heatmap.grid.stroke.width / 2,
    };

    const yAxis: Dimensions = {
      width: axesSizes.yAxis.width,
      height: grid.height,
      top: grid.top,
      left: grid.left - axesSizes.yAxis.width,
    };

    const xAxis: Dimensions = {
      width: grid.width,
      height: axesSizes.xAxis.height,
      top: grid.top + grid.height,
      left: grid.left,
    };

    return {
      yAxis,
      xAxis,
      visibleNumberOfRows,
      fullHeatmapHeight,
      rowHeight,
      xAxisTickCadence: axesSizes.xAxis.tickCadence,
      xLabelRotation: axesSizes.xAxis.minRotation,
    };
  },
);
