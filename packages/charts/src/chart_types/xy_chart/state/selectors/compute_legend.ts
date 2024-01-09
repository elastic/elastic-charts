/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesDomainsSelector } from './compute_series_domains';
import { getSeriesColorsSelector } from './get_series_color_map';
import { getSiDataSeriesMapSelector } from './get_si_dataseries_map';
import { getSeriesSpecsSelector, getAxisSpecsSelector } from './get_specs';
import { LegendItem } from '../../../../common/legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getDeselectedSeriesSelector } from '../../../../state/selectors/get_deselected_data_series';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { computeLegend } from '../../legend/legend';
import { DataSeries } from '../../utils/series';

/** @internal */
export const computeLegendSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    computeSeriesDomainsSelector,
    getChartThemeSelector,
    getSeriesColorsSelector,
    getAxisSpecsSelector,
    getDeselectedSeriesSelector,
    getSettingsSpecSelector,
    getSiDataSeriesMapSelector,
  ],
  (
    seriesSpecs,
    { formattedDataSeries, xDomain },
    chartTheme,
    seriesColors,
    axesSpecs,
    deselectedDataSeries,
    settings,
    siDataSeriesMap: Record<string, DataSeries>,
  ): LegendItem[] => {
    return computeLegend(
      xDomain,
      formattedDataSeries,
      seriesColors,
      seriesSpecs,
      axesSpecs,
      settings,
      siDataSeriesMap,
      chartTheme,
      deselectedDataSeries,
    );
  },
);
