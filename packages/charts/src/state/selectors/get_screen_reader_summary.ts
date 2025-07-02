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
import { ChartType } from '../../chart_types';
import { createChartTypeDescription } from '../../components/accessibility/chart_summary_utils';
import type { ChartSpecificScreenReaderData } from '../chart_selectors';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export interface ScreenReaderSummaryData {
  a11ySettings: A11ySettings;
  screenReaderData?: ChartSpecificScreenReaderData;
  chartTypeDescription: string;
  chartType: ChartType | null;
  chartSpecificData?: ChartSpecificScreenReaderData;
  consolidatedSummary: string;
}

const DEFAULT_SCREEN_READER_SUMMARY: ScreenReaderSummaryData = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  screenReaderData: undefined,
  chartTypeDescription: '',
  chartType: null,
  chartSpecificData: undefined,
  consolidatedSummary: '',
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

    // Get chart-specific screen reader data
    const screenReaderData = internalChartState.getScreenReaderData?.(state);

    const chartTypeDescription = internalChartState.getChartTypeDescription(state);

    // Get chart-specific screen reader data
    const chartSpecificData = internalChartState.getScreenReaderData?.(state);

    // Generate consolidated summary
    const parts: string[] = [];

    // Chart type and series information - use chart-specific logic for XY charts
    if (chartType === ChartType.XYAxis && chartSpecificData?.data) {
      const { seriesSpecs, seriesDomains } = chartSpecificData.data;
      const chartDescription = createChartTypeDescription(chartTypeDescription, seriesSpecs, seriesDomains);
      if (chartDescription) {
        parts.push(chartDescription);
      }
    } else {
      // For other chart types, use the basic chart type description
      if (chartTypeDescription) {
        parts.push(chartTypeDescription);
      }
    }

    // Add chart-specific summary parts
    if (chartSpecificData?.summaryParts) {
      parts.push(...chartSpecificData.summaryParts);
    }

    const consolidatedSummary = parts.length > 0 ? `${parts.join('. ')}.` : '';

    return {
      chartTypeDescription,
      a11ySettings,
      chartType,
      chartSpecificData,
      consolidatedSummary,
      screenReaderData,
    };
  },
);
