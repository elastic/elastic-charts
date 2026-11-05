/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Dispatch } from '@reduxjs/toolkit';
import { bindActionCreators } from '@reduxjs/toolkit';
import type { CSSProperties, RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';

import type { TimeslipLoop } from './timeslip/timeslip_render';
import { timeslipRender } from './timeslip/timeslip_render';
import type { TimeslipSpec, GetData } from './timeslip_api';
import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { createFrameSurface } from '../../renderers/frame_surface';
import type { SettingsSpec } from '../../specs';
import { TooltipType } from '../../specs';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { onChartRendered } from '../../state/actions/chart';
import type { GlobalChartState } from '../../state/chart_state';
import type { BackwardRef, ChartRenderer, StageElement } from '../../state/internal_chart_renderer';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../state/selectors/get_tooltip_spec';
import { getSpecsFromStore } from '../../state/utils/get_specs_from_store';
import type { Size } from '../../utils/dimensions';

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
  forwardStageRef: RefObject<StageElement>;
}

type TimeslipProps = StateProps & DispatchProps & OwnProps;

/**
 * Timeslip runs its own frame loop and listens on its stage element itself, so it draws through a
 * `FrameSurface` (a canvas, or an svg committed frame by frame) rather than the React driven `Stage`.
 */
class TimeslipComponent extends React.Component<TimeslipProps> {
  static displayName = 'Timeslip';

  private readonly preventWheel = (e: WheelEvent) => e.preventDefault();

  private loop: TimeslipLoop | null = null;

  /** starts the frame loop on the stage element currently in the DOM */
  private startFrameLoop() {
    this.loop?.stop();
    this.loop = null;
    const element = this.props.forwardStageRef.current;
    const surface = element && createFrameSurface(element);
    if (surface) this.loop = timeslipRender(surface, this.props.getData);
  }

  componentDidMount = () => {
    this.props.onRenderChange(true); // emit API callback
    this.props.onChartRendered();
    this.props.containerRef().current?.addEventListener('wheel', this.preventWheel, { passive: false });
    this.startFrameLoop();
  };

  componentDidUpdate(prevProps: TimeslipProps) {
    if (prevProps.getData !== this.props.getData) {
      this.startFrameLoop();
    } else if (prevProps.chartDimensions !== this.props.chartDimensions) {
      // a new size resets the canvas bitmap, and the loop only renders on interaction or a window resize
      this.loop?.render();
    }
  }

  componentWillUnmount() {
    this.props.containerRef().current?.removeEventListener('wheel', this.preventWheel);
    this.loop?.stop();
    this.loop = null;
  }

  render = () => {
    const {
      forwardStageRef,
      chartDimensions: { width: requestedWidth, height: requestedHeight },
      a11ySettings,
    } = this.props;
    // the stage fills the content area exactly: a size rounded up (as the WebGL flame chart does for its textures)
    // overflowed the clipped container and cropped the bottom label row and the right edge
    const width = Math.floor(requestedWidth);
    const height = Math.floor(requestedHeight);
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
      outline: 'none',
    };

    return (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <canvas /* Canvas2d layer */
          ref={forwardStageRef as RefObject<HTMLCanvasElement>}
          tabIndex={0}
          className="echCanvasRenderer"
          width={width * window.devicePixelRatio}
          height={height * window.devicePixelRatio}
          style={style}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        />
      </figure>
    );
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
export const chartRenderer: ChartRenderer = (containerRef: BackwardRef, forwardStageRef: RefObject<StageElement>) => (
  <TimeslipChartLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />
);
