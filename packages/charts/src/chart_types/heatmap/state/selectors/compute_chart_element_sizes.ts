/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeAxesSizesSelector } from './compute_axes_sizes';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getPanelSize } from '../../../../common/panel_utils';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { Dimensions } from '../../../../utils/dimensions';

/** @internal */
export type ChartElementSizes = {
  yAxis: Dimensions;
  xAxis: Dimensions;
  xAxisTickCadence: number;
  xLabelRotation: number;
};

/**
 * Returns grid and axes sizes and positions.
 * @internal
 */
export const computeChartElementSizesSelector = createCustomCachedSelector(
  [computeChartDimensionsSelector, computeAxesSizesSelector, getChartThemeSelector, computeSmallMultipleScalesSelector],
  ({ chartDimensions }, axesSizes, { heatmap }, smScales): ChartElementSizes => {
    const panelHeight = getPanelSize(smScales).height;
    const grid: Dimensions = {
      width: axesSizes.xAxis.width,
      height: panelHeight,
      left: chartDimensions.left + axesSizes.xAxis.left,
      top: chartDimensions.top + heatmap.grid.stroke.width / 2,
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
      xAxisTickCadence: axesSizes.xAxis.tickCadence,
      xLabelRotation: axesSizes.xAxis.minRotation,
    };
  },
);
