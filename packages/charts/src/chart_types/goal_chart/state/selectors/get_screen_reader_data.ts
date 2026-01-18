/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getGoalChartDataSelector, getGoalChartLabelsSelector } from './get_goal_chart_data';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';
import { EMPTY_SCREEN_READER_ITEMS, type ScreenReaderItem } from '../../../../state/selectors/get_screenreader_data';

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [
    getGoalChartDataSelector,
    getGoalChartLabelsSelector,
    getInternalChartStateSelector,
    getA11ySettingsSelector,
    (state: GlobalChartState) => state,
  ],
  (goalChartData, goalChartLabels, internalChartState, a11ySettings, state): ScreenReaderItem[] => {
    const screenReaderItems: ScreenReaderItem[] = [];

    // Add chart type description first
    const chartTypeDescription = internalChartState?.getChartTypeDescription(state);
    if (chartTypeDescription) {
      screenReaderItems.push({
        label: 'Chart type',
        id: a11ySettings.defaultSummaryId,
        value: chartTypeDescription,
      });
    }

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

    return screenReaderItems.length > 0 ? screenReaderItems : EMPTY_SCREEN_READER_ITEMS;
  },
);
