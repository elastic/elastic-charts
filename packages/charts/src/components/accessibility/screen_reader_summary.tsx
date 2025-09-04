/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';

import { ScreenReaderDescription } from './description';
import { ScreenReaderLabel } from './label';
import { ScreenReaderTypes } from './types';
import type { GoalChartData, GoalChartLabels } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import {
  getGoalChartDataSelector,
  getGoalChartLabelsSelector,
} from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import type { GlobalChartState } from '../../state/chart_state';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getInternalChartStateSelector } from '../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';

interface ScreenReaderSummaryStateProps {
  a11ySettings: A11ySettings;
  chartTypeDescription: string;
  goalChartData?: GoalChartData;
  goalChartLabels?: GoalChartLabels;
}

const ScreenReaderSummaryComponent = ({
  a11ySettings,
  chartTypeDescription,
  goalChartData,
  goalChartLabels,
}: ScreenReaderSummaryStateProps) => {
  return (
    <div className="echScreenReaderOnly" data-testid="echScreenReaderSummary">
      <ScreenReaderLabel {...a11ySettings} goalChartLabels={goalChartLabels} />
      <ScreenReaderDescription {...a11ySettings} />
      <ScreenReaderTypes {...a11ySettings} chartTypeDescription={chartTypeDescription} goalChartData={goalChartData} />
    </div>
  );
};

const DEFAULT_SCREEN_READER_SUMMARY = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  chartTypeDescription: '',
  goalChartData: undefined,
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderSummaryStateProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState === null || getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }
  return {
    chartTypeDescription: internalChartState.getChartTypeDescription(state),
    a11ySettings: getA11ySettingsSelector(state),
    goalChartData: getGoalChartDataSelector(state),
    goalChartLabels: getGoalChartLabelsSelector(state),
  };
};

/** @internal */
export const ScreenReaderSummary = memo(connect(mapStateToProps)(ScreenReaderSummaryComponent));
