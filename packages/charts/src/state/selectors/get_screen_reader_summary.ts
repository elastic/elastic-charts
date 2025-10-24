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
import type { ScreenReaderItem } from './get_screenreader_data';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export interface ScreenReaderSummaryData {
  a11ySettings: A11ySettings;
  screenReaderItems: ScreenReaderItem[];
}

const DEFAULT_SCREEN_READER_SUMMARY: ScreenReaderSummaryData = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  screenReaderItems: [],
};

/** @internal */
export const getScreenReaderSummarySelector = createCustomCachedSelector(
  [
    getInternalChartStateSelector,
    getInternalIsInitializedSelector,
    getA11ySettingsSelector,
    (state: GlobalChartState) => state,
  ],
  (internalChartState, initStatus, a11ySettings, state) => {
    if (internalChartState === null || initStatus !== InitStatus.Initialized) {
      return DEFAULT_SCREEN_READER_SUMMARY;
    }

    // Get chart-specific screen reader data
    const screenReaderItems = internalChartState.getScreenReaderData(state);

    return {
      a11ySettings,
      screenReaderItems,
    };
  },
);
