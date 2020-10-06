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
import createCachedSelector from 're-reselect';

import { GlobalChartState } from '../../../../state/chart_state';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { Position } from '../../../../utils/commons';
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
export const getGridHeightParamsSelector = createCachedSelector(
  [
    getLegendSizeSelector,
    getSettingsSpecSelector,
    getParentDimension,
    getHeatmapConfigSelector,
    getHeatmapTableSelector,
  ],
  (
    legendSize,
    { showLegend, legendPosition },
    { height: containerHeight },
    { xAxisLabel: { padding, visible, fontSize }, grid, maxLegendHeight },
    { yValues },
  ): GridHeightParams => {
    const xAxisHeight = visible ? fontSize : 0;
    const totalVerticalPadding = padding * 2;
    let legendHeight = 0;
    if (showLegend && (legendPosition === Position.Top || legendPosition === Position.Bottom)) {
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
)(getChartIdSelector);

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
