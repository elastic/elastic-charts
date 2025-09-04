/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getGoalChartDataSelector, getGoalChartLabelsSelector } from './get_goal_chart_data';
import type { ChartSpecificScreenReaderData, ScreenReaderType } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [
    getGoalChartDataSelector,
    getGoalChartLabelsSelector,
    getInternalChartStateSelector,
    getA11ySettingsSelector,
    (state) => state,
  ],
  (goalChartData, goalChartLabels, internalChartState, a11ySettings, state): ChartSpecificScreenReaderData => {
    const screenReaderTypes: ScreenReaderType[] = [];

    // Add chart type description first
    const chartTypeDescription = internalChartState?.getChartTypeDescription(state);
    if (chartTypeDescription) {
      screenReaderTypes.push({
        label: 'Chart type',
        id: a11ySettings.defaultSummaryId,
        value: chartTypeDescription,
      });
    }

    // Add goal chart specific parts
    if (goalChartData && !isNaN(goalChartData.maximum)) {
      screenReaderTypes.push(
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

    const returnValue = {
      screenReaderTypes,
      labelData: {
        majorLabel: goalChartLabels.majorLabel,
        minorLabel: goalChartLabels.minorLabel,
      },
    };

    return returnValue;
  },
);
