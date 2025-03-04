/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getLegendConfigSelector } from '../../../../state/selectors/get_legend_config_selector';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { LayoutDirection } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/**
 * Gets charts grid area excluding legend and X,Y axis labels and paddings.
 * @internal
 */
export const getHeatmapContainerSizeSelector = createCustomCachedSelector(
  [getParentDimension, getLegendSizeSelector, getChartThemeSelector, getLegendConfigSelector],
  (parentDimensions, legendSize, { heatmap: { maxLegendHeight } }, { showLegend, legendPosition }): Dimensions => {
    if (!showLegend || legendPosition.floating) {
      return parentDimensions;
    }
    if (legendPosition.direction === LayoutDirection.Vertical) {
      return {
        left: 0,
        top: 0,
        width: parentDimensions.width - legendSize.width - legendSize.margin * 2,
        height: parentDimensions.height,
      };
    }

    const legendHeight = maxLegendHeight ?? legendSize.height + legendSize.margin * 2;

    return {
      left: 0,
      top: 0,
      width: parentDimensions.width,
      height: parentDimensions.height - legendHeight,
    };
  },
);
