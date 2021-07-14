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

import { max as d3Max } from 'd3-array';

import { Box, measureText } from '../../../../common/text_utils';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { isHorizontalLegend } from '../../../../utils/legend';
// import { config } from '../../layout/config/config';
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
    config,
    // { xAxisLabel: { padding, visible, fontSize, formatter }, grid, maxLegendHeight },
    { table, yValues },
  ): GridHeightParams => {
    // where the x axis height gets taken into account

    // TODO - only do all of this when the x axis tick labels are rotated
    const xValues = table.map((entry) => entry.x);
    const formattedXValues = xValues.map(config.xAxisLabel.formatter);
    const boxedXValues = formattedXValues.map<Box & { value: string | number }>((value) => {
      return {
        text: String(value),
        value,
        ...config.xAxisLabel,
      };
    });
    // console.log('formattedXValues:', formattedXValues);
    const textMeasurer = document.createElement('canvas');
    const textMeasurerCtx = textMeasurer.getContext('2d');
    const textMeasure = measureText(textMeasurerCtx!);

    const measuredXValues = textMeasure(config.xAxisLabel.fontSize, boxedXValues);
    const xAxisHeightMeasured: number = d3Max(measuredXValues, ({ width }) => width) ?? 0;
    // const xAxisHeight = visible ? fontSize : 0;
    const xAxisHeight = config.xAxisLabel.visible ? xAxisHeightMeasured : 0;
    const totalVerticalPadding = config.xAxisLabel.padding * 2;
    let legendHeight = 0;
    if (showLegend && isHorizontalLegend(legendSize.position)) {
      legendHeight = config.maxLegendHeight ?? legendSize.height;
    }
    const verticalRemainingSpace = containerHeight - xAxisHeight - totalVerticalPadding - legendHeight;

    // compute the grid cell height
    const gridCellHeight = getGridCellHeight(yValues, config.grid, verticalRemainingSpace);
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
