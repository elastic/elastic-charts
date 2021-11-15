/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { max as d3Max } from 'd3-array';

import { Box, measureText } from '../../../../common/text_utils';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { Position } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { XDomain } from '../../../xy_chart/domains/types';
import { HeatmapCellDatum } from '../../layout/viewmodel/viewmodel';
import { getGridHeightParamsSelector } from './get_grid_full_height';
import { getHeatmapConfigSelector } from './get_heatmap_config';
import { getHeatmapTableSelector } from './get_heatmap_table';
import { getXAxisRightOverflow } from './get_x_axis_right_overflow';

/** @internal */
export interface HeatmapTable {
  table: Array<HeatmapCellDatum>;
  // unique set of column values
  xDomain: XDomain;
  // unique set of row values
  yValues: Array<string | number>;
  extent: [number, number];
}

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/**
 * Gets charts grid area excluding legend and X,Y axis labels and paddings.
 * @internal
 */
export const computeChartDimensionsSelector = createCustomCachedSelector(
  [
    getParentDimension,
    getLegendSizeSelector,
    getHeatmapTableSelector,
    getHeatmapConfigSelector,
    getXAxisRightOverflow,
    getGridHeightParamsSelector,
    getSettingsSpecSelector,
  ],
  (
    chartContainerDimensions,
    legendSize,
    heatmapTable,
    config,
    rightOverflow,
    { height },
    { showLegend, legendPosition },
  ): Dimensions => {
    let { width, left } = chartContainerDimensions;
    const { top } = chartContainerDimensions;
    const { padding } = config.yAxisLabel;

    const textMeasurer = document.createElement('canvas');
    const textMeasurerCtx = textMeasurer.getContext('2d');
    const textMeasure = measureText(textMeasurerCtx!);

    const totalHorizontalPadding =
      typeof padding === 'number' ? padding * 2 : (padding.left ?? 0) + (padding.right ?? 0);

    if (config.yAxisLabel.visible) {
      // measure the text width of all rows values to get the grid area width
      const boxedYValues = heatmapTable.yValues.map<Box & { value: string | number }>((value) => {
        return {
          text: String(value),
          value,
          isValue: false,
          ...config.yAxisLabel,
        };
      });
      const measuredYValues = textMeasure(config.yAxisLabel.fontSize, boxedYValues);

      let yColumnWidth: number = d3Max(measuredYValues, ({ width }) => width) ?? 0;
      if (typeof config.yAxisLabel.width === 'number') {
        yColumnWidth = config.yAxisLabel.width;
      } else if (typeof config.yAxisLabel.width === 'object' && yColumnWidth > config.yAxisLabel.width.max) {
        yColumnWidth = config.yAxisLabel.width.max;
      }

      width -= yColumnWidth + rightOverflow + totalHorizontalPadding;
      left += yColumnWidth + totalHorizontalPadding;
    }
    let legendWidth = 0;
    if (showLegend && (legendPosition === Position.Right || legendPosition === Position.Left)) {
      legendWidth = legendSize.width - legendSize.margin * 2;
    }
    width -= legendWidth;

    return {
      height,
      width,
      top,
      left,
    };
  },
);
