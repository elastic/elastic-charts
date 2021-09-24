/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { OrderBy, SortSeriesByConfig } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SeriesCompareFn } from '../../../../utils/series_sort';
import { SeriesDomainsAndData } from '../utils/types';
import { computeSeriesDomains } from '../utils/utils';
import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getSeriesSpecsSelector, getSmallMultiplesIndexOrderSelector } from './get_specs';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

/** @internal */
export const computeSeriesDomainsSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    getScaleConfigsFromSpecsSelector,
    getDeselectedSeriesSelector,
    getSettingsSpecSelector,
    getSmallMultiplesIndexOrderSelector,
  ],
  (seriesSpecs, scaleConfigs, deselectedDataSeries, settingsSpec, smallMultiples): SeriesDomainsAndData => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (settingsSpec.sortSeriesBy) throw new Error('Fuck!');
    return computeSeriesDomains(
      seriesSpecs,
      scaleConfigs,
      deselectedDataSeries,
      (settingsSpec as unknown) as {
        orderOrdinalBinsBy: OrderBy;
        sortSeriesBy: SeriesCompareFn | SortSeriesByConfig;
      },
      smallMultiples,
    );
  },
);
