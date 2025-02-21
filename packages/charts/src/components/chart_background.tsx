/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';

import { Colors } from '../common/colors';
import type { GlobalChartState } from '../state/chart_state';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getInternalChartStateSelector } from '../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../state/selectors/get_internal_is_intialized';

interface ChartBackgroundProps {
  backgroundColor: string;
}

/** @internal */
export class ChartBackgroundComponent extends React.Component<ChartBackgroundProps> {
  static displayName = 'ChartBackground';

  render() {
    const { backgroundColor } = this.props;
    return <div className="echChartBackground" style={{ backgroundColor }} />;
  }
}

const mapStateToProps = (state: GlobalChartState): ChartBackgroundProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (getInternalIsInitializedSelector(state, internalChartState) !== InitStatus.Initialized) {
    return {
      backgroundColor: Colors.Transparent.keyword,
    };
  }
  return {
    backgroundColor: getChartThemeSelector(state).background.color,
  };
};

/** @internal */
export const ChartBackground = connect(mapStateToProps)(ChartBackgroundComponent);
