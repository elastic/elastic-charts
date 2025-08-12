/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getGoalChartDataSelector, getGoalChartLabelsSelector } from './get_goal_chart_data';
import type { ChartType } from '../../../../chart_types';
import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';
import { createGoalChartDescription } from '../../utils/summary_utils';

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [
    getGoalChartDataSelector,
    getGoalChartLabelsSelector,
    (state) => state.chartType,
    getInternalChartStateSelector,
    (state) => state,
  ],
  (goalChartData, goalChartLabels, chartType, internalChartState, state): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

    // Add chart type description first
    const chartTypeDescription = internalChartState?.getChartTypeDescription(state);
    if (chartTypeDescription) {
      summaryParts.push(chartTypeDescription);
    }

    // Add goal chart specific description
    const goalDescription = createGoalChartDescription(chartType as ChartType, goalChartData);
    if (goalDescription) {
      summaryParts.push(goalDescription);
    }

    const returnValue = {
      summaryParts,
      labelData: {
        primaryLabel: goalChartLabels.majorLabel,
        secondaryLabel: goalChartLabels.minorLabel,
      },
    };

    return returnValue;
  },
);
