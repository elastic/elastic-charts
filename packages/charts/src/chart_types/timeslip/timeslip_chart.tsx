/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { CSSProperties, RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { timeslipRender } from './timeslip/timeslip_render';
import { TimeslipSpec, GetData } from './timeslip_api';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { TooltipType } from '../../specs/constants';
import { SettingsSpec } from '../../specs/settings';
import { SpecType } from '../../specs/spec_type';
import { onChartRendered } from '../../state/actions/chart';
import { GlobalChartState } from '../../state/chart_state';
import { BackwardRef } from '../../state/internal_chart_state';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../state/selectors/get_tooltip_spec';
import { getSpecsFromStore } from '../../state/utils/get_specs_from_store';
import { Size } from '../../utils/dimensions';
import { ChartType } from '../chart_type';
import { roundUpSize } from '../flame_chart/render/common';
// @ts-ignore until it becomes TS

interface StateProps {
  getData: GetData;
  chartDimensions: Size;
  a11ySettings: ReturnType<typeof getA11ySettingsSelector>;
  tooltipRequired: boolean;
  onElementOver: NonNullable<SettingsSpec['onElementOver']>;
  onElementClick: NonNullable<SettingsSpec['onElementClick']>;
  onElementOut: NonNullable<SettingsSpec['onElementOut']>;
  onRenderChange: NonNullable<SettingsSpec['onRenderChange']>;
}

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface OwnProps {
  containerRef: BackwardRef;
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type TimeslipProps = StateProps & DispatchProps & OwnProps;

class TimeslipComponent extends React.Component<TimeslipProps> {
  static displayName = 'Timeslip';

  // DOM API Canvas2d and WebGL resources
  private ctx: CanvasRenderingContext2D | null = null;

  componentDidMount = () => {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    this.drawCanvas();
    this.props.onChartRendered();
    this.props.containerRef().current?.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

    const canvas = this.props.forwardStageRef.current;
    if (canvas && this.ctx) timeslipRender(canvas, this.ctx, this.props.getData);
  };

  componentWillUnmount() {
    this.props.containerRef().current?.removeEventListener('wheel', (e) => e.preventDefault());
  }

  componentDidUpdate = () => {
    if (!this.ctx) this.tryCanvasContext();
  };

  render = () => {
    const {
      forwardStageRef,
      chartDimensions: { width: requestedWidth, height: requestedHeight },
      a11ySettings,
    } = this.props;
    const width = roundUpSize(requestedWidth);
    const height = roundUpSize(requestedHeight);
    const style: CSSProperties = {
      width,
      height,
      top: 0,
      left: 0,
      padding: 0,
      margin: 0,
      border: 0,
      position: 'absolute',
      cursor: DEFAULT_CSS_CURSOR,
      touchAction: 'none',
    };

    const dpr = window.devicePixelRatio; /* * this.pinchZoomScale */
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;
    return (
      <>
        <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
          <canvas /* Canvas2d layer */
            ref={forwardStageRef}
            tabIndex={0}
            className="echCanvasRenderer"
            width={canvasWidth}
            height={canvasHeight}
            style={{ ...style, outline: 'none' }}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
        </figure>
      </>
    );
  };

  private drawCanvas = () => {
    if (!this.ctx) return;
    this.props.onRenderChange(true); // emit API callback
  };

  private tryCanvasContext = () => {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  };
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const timeslipSpec = getSpecsFromStore<TimeslipSpec>(state.specs, ChartType.Timeslip, SpecType.Series)[0];
  const settingsSpec = getSettingsSpecSelector(state);
  return {
    getData: timeslipSpec?.getData ?? (() => []),
    chartDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    tooltipRequired: getTooltipSpecSelector(state).type !== TooltipType.None,

    // mandatory charts API protocol; todo extract these mappings once there are other charts like Timeslip
    onElementOver: settingsSpec.onElementOver ?? (() => {}),
    onElementClick: settingsSpec.onElementClick ?? (() => {}),
    onElementOut: settingsSpec.onElementOut ?? (() => {}),
    onRenderChange: settingsSpec.onRenderChange ?? (() => {}), // todo eventually also update data props on a local .echChartStatus element: data-ech-render-complete={rendered} data-ech-render-count={renderedCount} data-ech-debug-state={debugStateString}
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const TimeslipChartLayers = connect(mapStateToProps, mapDispatchToProps)(TimeslipComponent);

/** @internal */
export const TimeslipWithTooltip = (containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) => (
  <TimeslipChartLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />
);
