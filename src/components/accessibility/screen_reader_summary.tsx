/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';

import { GlobalChartState } from '../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getSeriesTypesSelector } from '../../state/selectors/get_series_types';
import { ScreenReaderDescription } from './description';
import { ScreenReaderLabel } from './label';
import { ScreenReaderTypes } from './types';

interface ScreenReaderSummaryStateProps {
  a11ySettings: A11ySettings;
  seriesTypes: string;
}

const ScreenReaderSummaryComponent = ({ a11ySettings, seriesTypes }: ScreenReaderSummaryStateProps) => {
  return (
    <div className="echScreenReaderOnly">
      <ScreenReaderLabel {...a11ySettings} />
      <ScreenReaderDescription {...a11ySettings} />
      <ScreenReaderTypes {...a11ySettings} chartSeriesTypes={seriesTypes} />
    </div>
  );
};

const DEFAULT_SCREEN_READER_SUMMARY = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  seriesTypes: '',
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderSummaryStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }
  return {
    seriesTypes: getSeriesTypesSelector(state),
    a11ySettings: getA11ySettingsSelector(state),
  };
};
/** @internal */
export const ScreenReaderSummary = memo(connect(mapStateToProps)(ScreenReaderSummaryComponent));
