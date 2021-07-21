/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { isHorizontalLegend } from '../../../../utils/legend';
import { Config } from '../../layout/types/config_types';
import { getHeatmapConfigSelector } from './get_heatmap_config';
import { getHeatmapTableSelector } from './get_heatmap_table';

/** @internal */
export interface GridHeightParams {
  height: number;
  gridCellHeight: number;
  pageSize: number;
}
const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const getGridHeightParamsSelector = createCustomCachedSelector(
  [
    getLegendSizeSelector,
    getSettingsSpecSelector,
    getParentDimension,
    getHeatmapConfigSelector,
    getHeatmapTableSelector,
  ],
  (
    legendSize,
    { showLegend },
    { height: containerHeight },
    { xAxisLabel: { padding, visible, fontSize }, grid, maxLegendHeight },
    { yValues },
  ): GridHeightParams => {
    const xAxisHeight = visible ? fontSize : 0;
    const totalVerticalPadding = padding * 2;
    let legendHeight = 0;
    if (showLegend && isHorizontalLegend(legendSize.position)) {
      legendHeight = maxLegendHeight ?? legendSize.height;
    }
    const verticalRemainingSpace = containerHeight - xAxisHeight - totalVerticalPadding - legendHeight;

    // compute the grid cell height
    const gridCellHeight = getGridCellHeight(yValues, grid, verticalRemainingSpace);
    const height = gridCellHeight * yValues.length;

    const pageSize =
      gridCellHeight > 0 && height > containerHeight
        ? Math.floor(verticalRemainingSpace / gridCellHeight)
        : yValues.length;
    return {
      height,
      gridCellHeight,
      pageSize,
    };
  },
);

function getGridCellHeight(yValues: Array<string | number>, grid: Config['grid'], height: number): number {
  if (yValues.length === 0) {
    return height;
  }
  const stretchedHeight = height / yValues.length;

  if (stretchedHeight < grid.cellHeight.min) {
    return grid.cellHeight.min;
  }
  if (grid.cellHeight.max !== 'fill' && stretchedHeight > grid.cellHeight.max) {
    return grid.cellHeight.max;
  }

  return stretchedHeight;
}
