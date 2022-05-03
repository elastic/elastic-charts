/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createRef, CSSProperties, MouseEvent, RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Tooltip } from '../../components/tooltip';
import { onDatumHovered } from '../../state/actions/hover';
import { BackwardRef, DrilldownAction, GlobalChartState } from '../../state/chart_state';
import { A11ySettings, getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { Size } from '../../utils/dimensions';
import { getFlameSpec } from './data_flow';
import { GEOM_INDEX_OFFSET } from './shaders';
import { AnimationState, ColumnarViewModel, GLResources, nullColumnarViewModel } from './types';
import { ensureLinearFlameWebGL, renderLinearFlameWebGL } from './webgl_linear_renderers';

const TWEEN_EPSILON_MS = 20;
const DUMMY_INDEX = 0 - GEOM_INDEX_OFFSET - 1; // GLSL doesn't guarantee a NaN, and it's a shader integer anyway, so let's find a safe special number
const SIDE_OVERSHOOT_RATIO = 0.05; // e.g. 0.05 means, extend the domain 5% to the left and 5% to the right
const TOP_OVERSHOOT_ROW_COUNT = 2; // e.g. 2 means, try to render two extra rows above (parent and grandparent)

interface ReactiveChartStateProps {
  columnarViewModel: ColumnarViewModel;
  animationDuration: number;
  chartDimensions: Size;
  a11ySettings: A11ySettings;
}

interface ReactiveChartDispatchProps {
  onDatumHovered: typeof onDatumHovered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type FlameProps = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

const rowHeight = (position: Float32Array) => (position.length >= 4 ? position[1] - position[3] : 1);

const columnToRowPositions = ({ position1, size1 }: ColumnarViewModel, i: number) => ({
  x0: position1[i * 2],
  x1: position1[i * 2] + size1[i],
  y0: position1[i * 2 + 1],
  y1: position1[i * 2 + 1] + rowHeight(position1),
});

const focusRect = (columnarViewModel: ColumnarViewModel, { datumIndex, timestamp }: DrilldownAction) => {
  if (Number.isNaN(datumIndex)) return { x0: 0, y0: 0, x1: 1, y1: 1, timestamp: 0 };
  const rect = columnToRowPositions(columnarViewModel, datumIndex);
  const sideOvershoot = SIDE_OVERSHOOT_RATIO * (rect.x1 - rect.x0);
  const topOvershoot = TOP_OVERSHOOT_ROW_COUNT * rowHeight(columnarViewModel.position1);
  const y1 = Math.min(1, rect.y1 + topOvershoot);
  return {
    timestamp,
    x0: Math.max(0, rect.x0 - sideOvershoot),
    x1: Math.min(1, rect.x1 + sideOvershoot),
    y0: y1 - 1,
    y1: y1,
  };
};

class FlameComponent extends React.Component<FlameProps> {
  static displayName = 'Flame';

  // firstRender = true; // this will be useful for stable resizing of treemaps
  private ctx: CanvasRenderingContext2D | null;
  private glResources: GLResources;
  private glCanvasRef: RefObject<HTMLCanvasElement>;
  private animationState: AnimationState;
  private drilldown: DrilldownAction;
  private prevDrilldown: DrilldownAction;
  private hoverIndex: number;
  private readonly devicePixelRatio: number; // fixme this be no constant: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes

  constructor(props: Readonly<FlameProps>) {
    super(props);
    this.ctx = null;
    this.glResources = {
      gl: null,
      columnarGeomData: nullColumnarViewModel,
      roundedRectRenderer: () => {},
      pickTextureRenderer: () => {},
      deallocateResources: () => {},
      pickTexture: null,
      textureWidth: NaN,
      textureHeight: NaN,
      vao: null,
      geomProgram: null,
      pickProgram: null,
      readPixelXY: () => NaN,
    };
    this.glCanvasRef = createRef();
    this.devicePixelRatio = window.devicePixelRatio;
    this.animationState = { rafId: NaN };
    this.drilldown = { datumIndex: 0, timestamp: -Infinity };
    this.prevDrilldown = { datumIndex: 0, timestamp: -Infinity };
    this.hoverIndex = DUMMY_INDEX;
  }

  private inTween(t: DOMHighResTimeStamp) {
    return this.drilldown.timestamp + this.props.animationDuration + TWEEN_EPSILON_MS >= t;
  }

  componentDidMount() {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    this.drawCanvas();
  }

  componentDidUpdate() {
    if (!this.ctx) this.tryCanvasContext();
  }

  getFocus() {
    const { x0: currentFocusX0, y0: currentFocusY0, x1: currentFocusX1, y1: currentFocusY1, timestamp } = focusRect(
      this.props.columnarViewModel,
      this.drilldown,
    );
    const { x0: prevFocusX0, y0: prevFocusY0, x1: prevFocusX1, y1: prevFocusY1 } = focusRect(
      this.props.columnarViewModel,
      this.prevDrilldown,
    );
    return {
      currentTimestamp: timestamp,
      currentFocusX0,
      currentFocusY0,
      currentFocusX1,
      currentFocusY1,
      prevFocusX0,
      prevFocusY0,
      prevFocusX1,
      prevFocusY1,
    };
  }

  getHoveredDatumIndex(e: MouseEvent<HTMLCanvasElement>) {
    if (!this.props.forwardStageRef.current || !this.ctx || this.inTween(e.timeStamp)) return;

    const picker = this.glResources.readPixelXY;
    const focus = this.getFocus();
    const box = this.props.forwardStageRef.current.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const datumIndex = picker(x, y, focus);

    return { datumIndex, timestamp: e.timeStamp };
  }

  handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
    const hovered = this.getHoveredDatumIndex(e);
    if (hovered) {
      this.props.onDatumHovered(hovered.datumIndex);
      this.hoverIndex = Number.isNaN(hovered.datumIndex) ? DUMMY_INDEX : hovered.datumIndex;
      this.drawCanvas();
    }
  }

  handleMouseClick(e: MouseEvent<HTMLCanvasElement>) {
    const hovered = this.getHoveredDatumIndex(e);
    if (hovered) {
      this.prevDrilldown = this.drilldown;
      this.drilldown = hovered;
      this.drawCanvas(); // consider switching to the less direct this.setState
    }
  }

  render() {
    const {
      forwardStageRef,
      chartDimensions: { width, height },
      a11ySettings,
    } = this.props;
    const style: CSSProperties = {
      width,
      height,
      top: 0,
      left: 0,
      padding: 0,
      margin: 0,
      border: 0,
      position: 'absolute',
      // cursor: 'crosshair',
    };
    const canvasWidth = width * this.devicePixelRatio;
    const canvasHeight = height * this.devicePixelRatio;
    return (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <canvas /* WebGL2 layer */
          ref={this.glCanvasRef}
          className="echCanvasRenderer"
          width={canvasWidth}
          height={canvasHeight}
          style={style}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        />
        <canvas /* Canvas2d layer */
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={canvasWidth}
          height={canvasHeight}
          onMouseMove={this.handleMouseMove.bind(this)}
          onMouseUp={this.handleMouseClick.bind(this)}
          style={style}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        />
      </figure>
    );
  }

  private drawCanvas() {
    if (this.ctx) {
      const { ctx, glResources, devicePixelRatio, props } = this;
      window.requestAnimationFrame((t) => {
        if (ctx instanceof CanvasRenderingContext2D) {
          renderLinearFlameWebGL(
            ctx,
            devicePixelRatio,
            props.chartDimensions.width,
            props.chartDimensions.height,
            props.animationDuration,
            this.getFocus(),
            this.hoverIndex,
            this.animationState,
            glResources,
            this.inTween(t),
          );
        }
      });
    }
  }

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    const glCanvas = this.glCanvasRef.current;
    this.ctx = canvas && canvas.getContext('2d');
    if (glCanvas) {
      this.glResources = ensureLinearFlameWebGL(
        glCanvas,
        this.glResources,
        this.devicePixelRatio,
        this.props.columnarViewModel,
        this.props.chartDimensions.width,
        this.props.chartDimensions.height,
      );
    }
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators({ onDatumHovered: onDatumHovered }, dispatch);

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  const flameSpec = getFlameSpec(state);
  return {
    columnarViewModel: flameSpec?.columnarData ?? nullColumnarViewModel,
    animationDuration: flameSpec?.animation.duration ?? 0,
    chartDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
  };
};

const FlameChartLayer = connect(mapStateToProps, mapDispatchToProps)(FlameComponent);

/** @internal */
export const FlameWithTooltip = (containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) => (
  <>
    <Tooltip getChartContainerRef={containerRef} />
    <FlameChartLayer forwardStageRef={forwardStageRef} />
  </>
);
