/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChartType } from '../../chart_types';
import type { GoalChartData, GoalChartLabels } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { BasicSeriesSpec, AxisSpec } from '../../chart_types/xy_chart/utils/specs';
import type { GlobalChartState } from '../../state/chart_state';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';
import { getScreenReaderSummarySelector } from '../../state/selectors/get_screen_reader_summary';

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
  consolidatedSummary: string;
}

/** @internal */
export const mapStateToProps = (state: GlobalChartState): ScreenReaderSummaryStateProps => {
  return getScreenReaderSummarySelector(state);
};
