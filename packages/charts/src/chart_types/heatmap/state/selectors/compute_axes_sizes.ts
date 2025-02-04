/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getScale } from '../../../../state/selectors/compute_small_multiple_scales';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalSmallMultiplesDomains } from '../../../../state/selectors/get_internal_sm_domains';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { isHorizontalLegend } from '../../../../utils/legend';
import { isRasterTimeScale } from '../../layout/viewmodel/viewmodel';
import { getTextSizeDimension, getYAxisHorizontalUsedSpace, getXAxisSize } from '../utils/axis';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/**
 * Returns grid and axes sizes and positions.
 * @internal
 */
export const computeAxesSizesSelector = createCustomCachedSelector(
  [
    getParentDimension,
    getLegendSizeSelector,
    getHeatmapTableSelector,
    getChartThemeSelector,
    getHeatmapSpecSelector,
    getSmallMultiplesSpec,
    getInternalSmallMultiplesDomains,
  ],
  (
    container,
    legendSize,
    { yValues, xValues },
    { heatmap, axes: { axisTitle: axisTitleStyle, axisPanelTitle: axisPanelTitleStyle }, chartMargins, chartPaddings },
    { xAxisTitle, yAxisTitle, xAxisLabelFormatter, yAxisLabelFormatter, xScale },
    smSpec,
    { smHDomain },
  ) => {
    // TODO find a cleaner way without circular dependencies
    const panelWidth = getScale(smHDomain, container.width, smSpec?.style?.horizontalPanelPadding).bandwidth;

    return withTextMeasure((textMeasure) => {
      const isLegendHorizontal = isHorizontalLegend(legendSize.position);
      const legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
      const legendHeight = isLegendHorizontal
        ? heatmap.maxLegendHeight ?? legendSize.height + legendSize.margin * 2
        : 0;

      const yAxisTitleHorizontalSize = getTextSizeDimension(yAxisTitle, axisTitleStyle, textMeasure, 'height');
      const yAxisPanelTitleHorizontalSize = getTextSizeDimension(
        yAxisTitle,
        axisPanelTitleStyle,
        textMeasure,
        'height',
        !smSpec?.splitVertically,
      );
      const yAxis = {
        width: getYAxisHorizontalUsedSpace(yValues, heatmap.yAxisLabel, yAxisLabelFormatter, textMeasure),
      };

      const xAxisTitleVerticalSize = getTextSizeDimension(xAxisTitle, axisTitleStyle, textMeasure, 'height');
      const xAxisPanelTitleVerticalSize = getTextSizeDimension(
        xAxisTitle,
        axisPanelTitleStyle,
        textMeasure,
        'height',
        !smSpec?.splitHorizontally,
      );
      const xAxis = getXAxisSize(
        !isRasterTimeScale(xScale),
        heatmap.xAxisLabel,
        xAxisLabelFormatter,
        xValues,
        textMeasure,
        panelWidth - legendWidth - heatmap.grid.stroke.width / 2 - chartPaddings.right - chartMargins.right,
        [
          yAxisTitleHorizontalSize + yAxisPanelTitleHorizontalSize + yAxis.width,
          0, // this can be used if we have a right Y axis
        ],
      );

      return {
        yAxis,
        xAxis,
        legendHeight,
        legendWidth,
        xAxisTitleVerticalSize,
        xAxisPanelTitleVerticalSize,
        yAxisTitleHorizontalSize,
        yAxisPanelTitleHorizontalSize,
      };
    });
  },
);
