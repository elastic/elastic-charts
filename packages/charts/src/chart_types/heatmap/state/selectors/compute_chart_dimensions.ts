/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeAxesSizesSelector } from './compute_axes_sizes';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { ChartDimensions } from '../../../xy_chart/utils/dimensions';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/**
 * Returns chart dimensions  axes sizes and positions.
 * @internal
 */
export const computeChartDimensionsSelector = createCustomCachedSelector(
  [getParentDimension, computeAxesSizesSelector, getChartThemeSelector],
  (parentDimensions, axesSizes, { heatmap, chartPaddings, chartMargins }): ChartDimensions => {
    const chartHeight =
      parentDimensions.height -
      axesSizes.xAxisTitleVerticalSize -
      axesSizes.xAxisPanelTitleVerticalSize -
      axesSizes.xAxis.height -
      axesSizes.legendHeight -
      heatmap.grid.stroke.width / 2;

    const chartWidth =
      parentDimensions.width -
      axesSizes.yAxisTitleHorizontalSize -
      axesSizes.yAxisPanelTitleHorizontalSize -
      axesSizes.yAxis.width -
      axesSizes.legendWidth -
      heatmap.grid.stroke.width / 2;

    // Calculate dimensions after applying paddings
    const paddedTop = parentDimensions.top + heatmap.grid.stroke.width / 2 + chartPaddings.top;
    const paddedLeft = parentDimensions.left + axesSizes.xAxis.left + chartPaddings.left;
    const paddedWidth = chartWidth - chartPaddings.left - chartPaddings.right;
    const paddedHeight = chartHeight - chartPaddings.top - chartPaddings.bottom;

    // Calculate dimensions after applying margins
    const top = paddedTop + chartMargins.top;
    const left = paddedLeft + chartMargins.left;
    const width = Math.max(0, paddedWidth - chartMargins.left - chartMargins.right);
    const height = Math.max(0, paddedHeight - chartMargins.bottom - chartMargins.top);

    return {
      leftMargin: NaN, // not used
      chartDimensions: { top, left, width, height },
    };
  },
);
