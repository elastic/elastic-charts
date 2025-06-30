/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types';
import { computeSeriesDomainsSelector } from '../../chart_types/xy_chart/state/selectors/compute_series_domains';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from '../../chart_types/xy_chart/state/selectors/get_specs';
import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { BasicSeriesSpec, AxisSpec } from '../../chart_types/xy_chart/utils/specs';
import type { ChartSpecificScreenReaderData } from '../../state/chart_selectors';
import type { GlobalChartState } from '../../state/chart_state';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS } from '../../state/selectors/get_accessibility_config';
import { getInternalChartStateSelector } from '../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getScreenReaderSummarySelector } from '../../state/selectors/get_screen_reader_summary';

/** @internal */
export interface ScreenReaderSummaryStateProps {
  a11ySettings: A11ySettings;
  screenReaderData?: ChartSpecificScreenReaderData;
  chartTypeDescription: string;
  seriesSpecs?: BasicSeriesSpec[];
  axisSpecs?: AxisSpec[];
  seriesDomains?: SeriesDomainsAndData;
  chartType: ChartType | null;
}

const DEFAULT_SCREEN_READER_SUMMARY: ScreenReaderSummaryStateProps = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  chartTypeDescription: '',
  seriesSpecs: undefined,
  axisSpecs: undefined,
  seriesDomains: undefined,
  chartType: null,
};

/** @internal */
export const mapStateToProps = (state: GlobalChartState): ScreenReaderSummaryStateProps => {
  const { a11ySettings, screenReaderData } = getScreenReaderSummarySelector(state);
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState === null || getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }

  // Get XY chart data when available
  let seriesSpecs: BasicSeriesSpec[] | undefined;
  let axisSpecs: AxisSpec[] | undefined;
  let seriesDomains: SeriesDomainsAndData | undefined;

  try {
    // Only get XY chart selectors if this is an XY chart
    if (state.chartType === ChartType.XYAxis) {
      seriesSpecs = getSeriesSpecsSelector(state);
      axisSpecs = getAxisSpecsSelector(state);
      seriesDomains = computeSeriesDomainsSelector(state);
    }
  } catch {
    // Silently handle any selector errors - these selectors may not apply to all chart types
  }

  return {
    chartTypeDescription: internalChartState.getChartTypeDescription(state),
    a11ySettings,
    screenReaderData,
    seriesSpecs,
    axisSpecs,
    seriesDomains,
    chartType: state.chartType,
  };
};
