/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { MouseEvent, RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { renderCanvas2d } from './canvas_renderers';
import type { Color } from '../../../../common/colors';
import { Colors } from '../../../../common/colors';
import type { Rectangle } from '../../../../common/geometry';
import { ScreenReaderSummary } from '../../../../components/accessibility';
import { onChartRendered } from '../../../../state/actions/chart';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import type { Dimensions } from '../../../../utils/dimensions';
import { GoalSemanticDescription } from '../../components/goal_semantic_description';
import type { BandViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { nullShapeViewModel } from '../../layout/types/viewmodel_types';
import type { Mark } from '../../layout/viewmodel/geoms';
import { initialBoundingBox } from '../../layout/viewmodel/geoms';
import { geometries, getPrimitiveGeoms } from '../../state/selectors/geometries';
import { getFirstTickValueSelector, getGoalChartSemanticDataSelector } from '../../state/selectors/get_goal_chart_data';
import { getCaptureBoundingBox } from '../../state/selectors/picked_shapes';

interface ReactiveChartStateProps {
  initialized: boolean;
  geometries: ShapeViewModel;
  geoms: Mark[];
  chartContainerDimensions: Dimensions;
  a11ySettings: A11ySettings;
  bandLabels: BandViewModel[];
  firstValue: number;
  captureBoundingBox: Rectangle;
  background: Color;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

class Component extends React.Component<Props> {
  static displayName = 'Goal';

  // firstRender = true; // this'll be useful for stable resizing of treemaps
  private ctx: CanvasRenderingContext2D | null;

  // see example https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#Example
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions

  constructor(props: Readonly<Props>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
  }

  componentDidMount() {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  componentDidUpdate() {
    if (!this.ctx) {
      this.tryCanvasContext();
    }
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
    const {
      initialized,
      chartContainerDimensions: { width, height },
      forwardStageRef,
      geometries,
      captureBoundingBox: capture,
    } = this.props;
    if (!forwardStageRef.current || !this.ctx || !initialized || width === 0 || height === 0) {
      return;
    }
    const picker = geometries.pickQuads;
    const box = forwardStageRef.current.getBoundingClientRect();
    const { chartCenter } = geometries;
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    if (capture.x0 <= x && x <= capture.x1 && capture.y0 <= y && y <= capture.y1) {
      return picker(x - chartCenter.x, y - chartCenter.y);
    }
  }

  render() {
    const {
      initialized,
      chartContainerDimensions: { width, height },
      forwardStageRef,
      a11ySettings,
      bandLabels,
      firstValue,
    } = this.props;
    if (!initialized || width === 0 || height === 0) {
      return null;
    }
    return (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <canvas
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={width * this.devicePixelRatio}
          height={height * this.devicePixelRatio}
          onMouseMove={this.handleMouseMove.bind(this)}
          style={{
            width,
            height,
          }}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        />
        <ScreenReaderSummary />
        <GoalSemanticDescription bandLabels={bandLabels} firstValue={firstValue} {...a11ySettings} />
      </figure>
    );
  }

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  private drawCanvas() {
    if (this.ctx) {
      renderCanvas2d(this.ctx, this.devicePixelRatio, this.props.geoms, this.props.background);
    }
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
  initialized: false,
  geometries: nullShapeViewModel(),
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
  captureBoundingBox: initialBoundingBox(),
  background: Colors.Transparent.keyword,
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    geometries: geometries(state),
    chartContainerDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    bandLabels: getGoalChartSemanticDataSelector(state),
    firstValue: getFirstTickValueSelector(state),
    geoms: getPrimitiveGeoms(state),
    captureBoundingBox: getCaptureBoundingBox(state),
    background: getChartThemeSelector(state).background.color,
  };
};

/** @internal */
export const Goal = connect(mapStateToProps, mapDispatchToProps)(Component);
