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
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { isHorizontalLegend } from '../../../../utils/legend';
import { isRasterTimeScale } from '../../layout/viewmodel/viewmodel';
import { getTextSizeDimension, getYAxisHorizontalUsedSpace, getXAxisSize } from '../utils/axis';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/**
 * Returns grid and axes sizes and positions.
 * @internal
 */
export const computeAxesSizesSelector = createCustomCachedSelector(
  [getParentDimension, getLegendSizeSelector, getHeatmapTableSelector, getChartThemeSelector, getHeatmapSpecSelector],
  (
    container,
    legendSize,
    { yValues, xValues },
    { heatmap, axes: { axisTitle: axisTitleStyle } },
    { xAxisTitle, yAxisTitle, xAxisLabelFormatter, yAxisLabelFormatter, xScale },
  ) => {
    return withTextMeasure((textMeasure) => {
      const isLegendHorizontal = isHorizontalLegend(legendSize.position);
      const legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
      const legendHeight = isLegendHorizontal
        ? heatmap.maxLegendHeight ?? legendSize.height + legendSize.margin * 2
        : 0;

      const yAxisTitleHorizontalSize = getTextSizeDimension(yAxisTitle, axisTitleStyle, textMeasure, 'height');
      const yAxis = {
        width: getYAxisHorizontalUsedSpace(yValues, heatmap.yAxisLabel, yAxisLabelFormatter, textMeasure),
      };

      const xAxisTitleVerticalSize = getTextSizeDimension(xAxisTitle, axisTitleStyle, textMeasure, 'height');
      const xAxis = getXAxisSize(
        !isRasterTimeScale(xScale),
        heatmap.xAxisLabel,
        xAxisLabelFormatter,
        xValues,
        textMeasure,
        container.width - legendWidth - heatmap.grid.stroke.width / 2, // we should consider also the grid width
        [
          yAxisTitleHorizontalSize + yAxis.width,
          0, // this can be used if we have a right Y axis
        ],
      );

      return {
        yAxis,
        xAxis,
        legendHeight,
        xAxisTitleVerticalSize,
      };
    });
  },
);
