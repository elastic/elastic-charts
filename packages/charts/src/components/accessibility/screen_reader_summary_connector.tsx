/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types';
import type { GoalChartData, GoalChartLabels } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import {
  getGoalChartDataSelector,
  getGoalChartLabelsSelector,
} from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import { computeSeriesDomainsSelector } from '../../chart_types/xy_chart/state/selectors/compute_series_domains';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from '../../chart_types/xy_chart/state/selectors/get_specs';
import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { BasicSeriesSpec, AxisSpec } from '../../chart_types/xy_chart/utils/specs';
import type { GlobalChartState } from '../../state/chart_state';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getInternalChartStateSelector } from '../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';

/** @internal */
export interface ScreenReaderSummaryStateProps {
  a11ySettings: A11ySettings;
  chartTypeDescription: string;
  goalChartData?: GoalChartData;
  goalChartLabels?: GoalChartLabels;
  seriesSpecs?: BasicSeriesSpec[];
  axisSpecs?: AxisSpec[];
  seriesDomains?: SeriesDomainsAndData;
  chartType: ChartType | null;
}

const DEFAULT_SCREEN_READER_SUMMARY = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  chartTypeDescription: '',
  goalChartData: undefined,
  seriesSpecs: undefined,
  axisSpecs: undefined,
  seriesDomains: undefined,
  chartType: null,
};

/** @internal */
export const mapStateToProps = (state: GlobalChartState): ScreenReaderSummaryStateProps => {
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
    a11ySettings: getA11ySettingsSelector(state),
    goalChartData: getGoalChartDataSelector(state),
    goalChartLabels: getGoalChartLabelsSelector(state),
    seriesSpecs,
    axisSpecs,
    seriesDomains,
    chartType: state.chartType,
  };
};
