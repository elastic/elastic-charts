/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesDomainsSelector } from './compute_series_domains';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';

/** @internal */
export interface XYChartScreenReaderData {
  seriesSpecs: ReturnType<typeof getSeriesSpecsSelector>;
  axisSpecs: ReturnType<typeof getAxisSpecsSelector>;
  seriesDomains: ReturnType<typeof computeSeriesDomainsSelector>;
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getSeriesSpecsSelector, getAxisSpecsSelector, computeSeriesDomainsSelector, getInternalChartStateSelector, (state) => state],
  (seriesSpecs, axisSpecs, seriesDomains, internalChartState, state): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

    // Add chart type description first
    const chartTypeDescription = internalChartState?.getChartTypeDescription(state);
    if (chartTypeDescription) {
      summaryParts.push(chartTypeDescription);
    }

    return {
      data: {
        seriesSpecs,
        axisSpecs,
        seriesDomains,
      } as XYChartScreenReaderData,
      summaryParts,
    };
  },
);
