/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';

/** @internal */
export interface WordcloudScreenReaderData {
  // Wordcloud-specific data fields
  // Add specific data fields as needed
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getInternalChartStateSelector, (state) => state],
  (internalChartState, state): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

    // Add chart type description first
    const chartTypeDescription = internalChartState?.getChartTypeDescription(state);
    if (chartTypeDescription) {
      summaryParts.push(chartTypeDescription);
    }

    return {
      data: {} as WordcloudScreenReaderData,
      summaryParts,
    };
  },
);
