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
import { computeSeriesDomainsSelector } from '../../chart_types/xy_chart/state/selectors/compute_series_domains';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from '../../chart_types/xy_chart/state/selectors/get_specs';
import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { BasicSeriesSpec, AxisSpec } from '../../chart_types/xy_chart/utils/specs';
import { createAxisDescriptions } from '../../components/accessibility/axis_summary_utils';
import { createChartTypeDescription } from '../../components/accessibility/chart_summary_utils';
import type { ChartSpecificScreenReaderData } from '../chart_selectors';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export interface ScreenReaderSummaryData {
  a11ySettings: A11ySettings;
  screenReaderData?: ChartSpecificScreenReaderData;
  chartTypeDescription: string;
  seriesSpecs?: BasicSeriesSpec[];
  axisSpecs?: AxisSpec[];
  seriesDomains?: SeriesDomainsAndData;
  chartType: ChartType | null;
  consolidatedSummary: string;
}

const DEFAULT_SCREEN_READER_SUMMARY: ScreenReaderSummaryData = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  screenReaderData: undefined,
  chartTypeDescription: '',
  seriesSpecs: undefined,
  axisSpecs: undefined,
  seriesDomains: undefined,
  chartType: null,
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
    let seriesSpecs: BasicSeriesSpec[] | undefined;
    let axisSpecs: AxisSpec[] | undefined;
    let seriesDomains: SeriesDomainsAndData | undefined;

    if (chartType === ChartType.XYAxis) {
      seriesSpecs = getSeriesSpecsSelector(state);
      axisSpecs = getAxisSpecsSelector(state);
      seriesDomains = computeSeriesDomainsSelector(state);
    }

    // Generate consolidated summary
    const parts: string[] = [];

    // Chart type and series information
    const chartDescription = createChartTypeDescription(chartTypeDescription, seriesSpecs, seriesDomains);
    console.log('chartDescription', chartDescription);
    if (chartDescription) {
      parts.push(chartDescription);
    }

    // Axis descriptions
    if (axisSpecs && axisSpecs.length > 0 && seriesDomains) {
      const axisDescriptions = createAxisDescriptions(axisSpecs, seriesDomains);
      parts.push(...axisDescriptions);
    }

    const consolidatedSummary = `${parts.join('. ')}.`;

    return {
      chartTypeDescription,
      a11ySettings,
      chartType,
      screenReaderData,
      seriesSpecs,
      axisSpecs,
      seriesDomains,
      consolidatedSummary,
    };
  },
);
