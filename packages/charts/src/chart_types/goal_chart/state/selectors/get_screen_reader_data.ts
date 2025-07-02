/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getGoalChartDataSelector, getGoalChartLabelsSelector } from './get_goal_chart_data';
import type { ChartSpecificScreenReaderData, ScreenReaderItem } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getGoalChartDataSelector, getGoalChartLabelsSelector],
  (goalChartData, goalChartLabels): ChartSpecificScreenReaderData => {
    const screenReaderItems: ScreenReaderItem[] = [];

    // Add goal chart specific parts
    if (goalChartData && !isNaN(goalChartData.maximum)) {
      if (goalChartLabels.majorLabel) {
        screenReaderItems.push({
          label: 'Major label',
          value: goalChartLabels.majorLabel,
        });
      }
      if (goalChartLabels.minorLabel) {
        screenReaderItems.push({
          label: 'Minor label',
          value: goalChartLabels.minorLabel,
        });
      }
      screenReaderItems.push(
        {
          label: 'Minimum',
          value: goalChartData.minimum.toString(),
        },
        {
          label: 'Maximum',
          value: goalChartData.maximum.toString(),
        },
        {
          label: 'Target',
          value: goalChartData.target?.toString() ?? 'N/A',
        },
        {
          label: 'Value',
          value: goalChartData.value.toString(),
        },
      );
    }

    const summaryParts: string[] = [];

    return {
      summaryParts,
      screenReaderItems,
    };
  },
);
