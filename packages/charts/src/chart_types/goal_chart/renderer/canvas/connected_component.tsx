/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Dispatch } from '@reduxjs/toolkit';
import { bindActionCreators } from '@reduxjs/toolkit';
import type { RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';

import { renderCanvas2d } from './canvas_renderers';
import type { Color } from '../../../../common/colors';
import { Colors } from '../../../../common/colors';
import { ScreenReaderSummary } from '../../../../components/accessibility';
import { Stage } from '../../../../components/stage';
import type { Painter, RendererType } from '../../../../renderers/painter';
import { onChartRendered } from '../../../../state/actions/chart';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { StageElement } from '../../../../state/internal_chart_renderer';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getDevicePixelRatioSelector } from '../../../../state/selectors/get_device_pixel_ratio';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getRendererSelector } from '../../../../state/selectors/get_renderer';
import type { Dimensions } from '../../../../utils/dimensions';
import { GoalSemanticDescription } from '../../components/goal_semantic_description';
import type { BandViewModel } from '../../layout/types/viewmodel_types';
import type { Mark } from '../../layout/viewmodel/geoms';
import { getPrimitiveGeoms } from '../../state/selectors/geometries';
import { getFirstTickValueSelector, getGoalChartSemanticDataSelector } from '../../state/selectors/get_goal_chart_data';

interface ReactiveChartStateProps {
  chartId: string;
  renderer: RendererType;
  initialized: boolean;
  geoms: Mark[];
  chartContainerDimensions: Dimensions;
  a11ySettings: A11ySettings;
  bandLabels: BandViewModel[];
  firstValue: number;
  background: Color;
  devicePixelRatio: number;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<StageElement>;
}

type Props = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

class Component extends React.Component<Props> {
  static displayName = 'Goal';

  private paint = (painter: Painter) => {
    renderCanvas2d(painter, this.props.geoms, this.props.background);
  };

  render() {
    const {
      initialized,
      chartContainerDimensions: { width, height },
      forwardStageRef,
      a11ySettings,
      bandLabels,
      firstValue,
      renderer,
      devicePixelRatio,
      chartId,
      onChartRendered: rendered,
    } = this.props;
    if (!initialized || width === 0 || height === 0) {
      return null;
    }
    return (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <Stage
          renderer={renderer}
          width={width}
          height={height}
          devicePixelRatio={devicePixelRatio}
          idPrefix={`${chartId}-goal`}
          forwardStageRef={forwardStageRef}
          paint={this.paint}
          onRendered={rendered}
        />
        <ScreenReaderSummary />
        <GoalSemanticDescription bandLabels={bandLabels} firstValue={firstValue} {...a11ySettings} />
      </figure>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const DEFAULT_PROPS: ReactiveChartStateProps = {
  chartId: '',
  renderer: 'canvas',
  initialized: false,
  geoms: [],
  chartContainerDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  bandLabels: [],
  firstValue: 0,
  background: Colors.Transparent.keyword,
  devicePixelRatio: 1,
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    chartId: state.chartId,
    renderer: getRendererSelector(state),
    initialized: true,
    chartContainerDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    bandLabels: getGoalChartSemanticDataSelector(state),
    firstValue: getFirstTickValueSelector(state),
    geoms: getPrimitiveGeoms(state),
    background: getChartThemeSelector(state).background.color,
    devicePixelRatio: getDevicePixelRatioSelector(state),
  };
};

/** @internal */
export const Goal = connect(mapStateToProps, mapDispatchToProps)(Component);
