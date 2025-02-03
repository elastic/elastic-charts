/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartThemeSelector } from './get_chart_theme';
import { getInternalCanDisplayChartTitles } from './get_internal_can_display_chart_titles';
import { getLegendConfigSelector } from './get_legend_config_selector';
import { LegendPositionConfig } from '../../specs/settings';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getChartContainerUpdateStateSelector = createCustomCachedSelector(
  [getLegendConfigSelector, getChartThemeSelector, getInternalCanDisplayChartTitles],
  (
    legendConfig,
    theme,
    displayTitles,
  ): {
    paddingLeft: number;
    paddingRight: number;
    displayTitles: boolean;
    legendDirection: LegendPositionConfig['direction'];
  } => {
    return {
      paddingLeft: theme.chartMargins.left,
      paddingRight: theme.chartMargins.right,
      displayTitles,
      legendDirection: legendConfig.legendPosition.direction,
    };
  },
);
