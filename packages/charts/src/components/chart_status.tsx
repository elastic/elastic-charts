/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';

import { RenderChangeListener } from '../specs';
import { GlobalChartState } from '../state/chart_state';
import { globalSelectorCache } from '../state/create_selector';
import { getDebugStateSelector } from '../state/selectors/get_debug_state';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import { DebugState } from '../state/types';

interface ChartStatusStateProps {
  chartId: string;
  rendered: boolean;
  renderedCount: number;
  onRenderChange?: RenderChangeListener;
  debugState: DebugState | null;
}

class ChartStatusComponent extends React.Component<ChartStatusStateProps> {
  componentDidMount() {
    this.dispatchRenderChange();
  }

  componentDidUpdate() {
    this.dispatchRenderChange();
  }

  componentWillUnmount() {
    globalSelectorCache.removeKeyFromAll(this.props.chartId);
  }

  dispatchRenderChange = () => {
    this.props.onRenderChange?.(this.props.rendered);
  };

  render() {
    const { rendered, renderedCount, debugState } = this.props;
    const debugStateString: string | null = debugState && JSON.stringify(debugState);
    return (
      <div
        className="echChartStatus"
        data-ech-render-complete={rendered}
        data-ech-render-count={renderedCount}
        data-ech-debug-state={debugStateString}
      />
    );
  }
}

const mapStateToProps = (state: GlobalChartState): ChartStatusStateProps => {
  const { onRenderChange, debugState } = getSettingsSpecSelector(state);

  return {
    chartId: state.chartId,
    rendered: state.chartRendered,
    renderedCount: state.chartRenderedCount,
    onRenderChange,
    debugState: debugState ? getDebugStateSelector(state) : null,
  };
};

/** @internal */
export const ChartStatus = connect(mapStateToProps)(ChartStatusComponent);
