/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getGoalChartDataSelector, getGoalChartLabelsSelector } from './get_goal_chart_data';
import type { ChartType } from '../../../../chart_types';
import { createGoalChartDescription } from '../../utils/summary_utils';
import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';

/** @internal */
export interface GoalChartScreenReaderData {
  goalChartData: ReturnType<typeof getGoalChartDataSelector>;
  goalChartLabels: ReturnType<typeof getGoalChartLabelsSelector>;
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getGoalChartDataSelector, getGoalChartLabelsSelector, (state) => state.chartType],
  (goalChartData, goalChartLabels, chartType): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

    // Add title from labels
    const title = `${goalChartLabels.majorLabel}${goalChartLabels.minorLabel}`.trim();
    if (title) {
      summaryParts.push(title);
    }

    // Add goal chart specific description
    const goalDescription = createGoalChartDescription(chartType as ChartType, goalChartData);
    if (goalDescription) {
      summaryParts.push(goalDescription);
    }

    return {
      data: {
        goalChartData,
        goalChartLabels,
      } as GoalChartScreenReaderData,
      summaryParts,
    };
  },
);
