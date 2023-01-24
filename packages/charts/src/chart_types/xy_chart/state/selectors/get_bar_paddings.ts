/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';

/** @internal */
export const getBarPaddingsSelector = createCustomCachedSelector(
  [isHistogramModeEnabledSelector, getChartThemeSelector],
  (isHistogramMode, chartTheme): number =>
    isHistogramMode ? chartTheme.scales.histogramPadding : chartTheme.scales.barsPadding,
);
