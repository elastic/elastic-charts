/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { A11ySettings } from './get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from './get_accessibility_config';
import { getInternalChartStateSelector } from './get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from './get_internal_is_intialized';
import type { ChartType } from '../../chart_types';
import type { ChartSpecificScreenReaderData } from '../chart_selectors';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export interface ScreenReaderSummaryData {
  a11ySettings: A11ySettings;
  chartTypeDescription: string;
  chartType: ChartType | null;
  chartSpecificData?: ChartSpecificScreenReaderData;
}

const DEFAULT_SCREEN_READER_SUMMARY: ScreenReaderSummaryData = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  chartTypeDescription: '',
  chartType: null,
  chartSpecificData: undefined,
};

/** @internal */
export const getScreenReaderSummarySelector = createCustomCachedSelector(
  [
    getInternalChartStateSelector,
    getInternalIsInitializedSelector,
    getA11ySettingsSelector,
    (state: GlobalChartState) => state.chartType,
    (state: GlobalChartState) => state,
  ],
  (internalChartState, initStatus, a11ySettings, chartType, state) => {
    if (internalChartState === null || initStatus !== InitStatus.Initialized) {
      return DEFAULT_SCREEN_READER_SUMMARY;
    }

    const chartTypeDescription = internalChartState.getChartTypeDescription(state);

    // Get chart-specific screen reader data
    const chartSpecificData = internalChartState.getScreenReaderData?.(state);

    // Keep the custom description from settings as-is
    // The ScreenReaderDescription component will handle rendering both
    // the structured summaryParts and the custom description

    return {
      chartTypeDescription,
      a11ySettings,
      chartType,
      chartSpecificData,
    };
  },
);
