/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';

/** @internal */
export interface HeatmapScreenReaderData {
  heatmapSpec: ReturnType<typeof getHeatmapSpecSelector>;
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector, getInternalChartStateSelector, (state) => state],
  (heatmapSpec, internalChartState, state): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

    // Add chart type description first
    const chartTypeDescription = internalChartState?.getChartTypeDescription(state);
    if (chartTypeDescription) {
      summaryParts.push(chartTypeDescription);
    }

    return {
      data: {
        heatmapSpec,
      } as HeatmapScreenReaderData,
      summaryParts,
    };
  },
);
