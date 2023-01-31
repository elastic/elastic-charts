/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesDomainsSelector } from './compute_series_domains';
import { Color } from '../../../../common/colors';
import { SeriesKey } from '../../../../common/series_id';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSeriesColors } from '../../utils/series';
import { getCustomSeriesColors } from '../utils/utils';

function getColorOverrides({ colors }: GlobalChartState) {
  return colors;
}

/** @internal */
export const getSeriesColorsSelector = createCustomCachedSelector(
  [computeSeriesDomainsSelector, getChartThemeSelector, getColorOverrides],
  (seriesDomainsAndData, chartTheme, colorOverrides): Map<SeriesKey, Color> => {
    const updatedCustomSeriesColors = getCustomSeriesColors(seriesDomainsAndData.formattedDataSeries);
    return getSeriesColors(
      seriesDomainsAndData.formattedDataSeries,
      chartTheme.colors,
      updatedCustomSeriesColors,
      colorOverrides,
    );
  },
);
