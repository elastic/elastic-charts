/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createRef, CSSProperties, MouseEvent, RefObject } from 'react';
import { connect } from 'react-redux';

import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { NakedTooltip } from '../../components/tooltip/tooltip';
import { getTooltipType, SettingsSpec, SpecType, TooltipType } from '../../specs';
import { ON_POINTER_MOVE } from '../../state/actions/mouse';
import { BackwardRef, DrilldownAction, GlobalChartState } from '../../state/chart_state';
import { A11ySettings, getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../state/utils';
import { Size } from '../../utils/dimensions';
import { FlameSpec } from './flame_api';
import { GEOM_INDEX_OFFSET } from './shaders';
import { AnimationState, ColumnarViewModel, GLResources, nullColumnarViewModel } from './types';
import { ensureLinearFlameWebGL, renderLinearFlameWebGL } from './webgl_linear_renderers';

const TWEEN_EPSILON_MS = 20;
const DUMMY_INDEX = 0 - GEOM_INDEX_OFFSET - 1; // GLSL doesn't guarantee a NaN, and it's a shader integer anyway, so let's find a safe special number
const SIDE_OVERSHOOT_RATIO = 0.05; // e.g. 0.05 means, extend the domain 5% to the left and 5% to the right
const TOP_OVERSHOOT_ROW_COUNT = 2; // e.g. 2 means, try to render two extra rows above (parent and grandparent)

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

const getColor = (c: Float32Array, i: number) => {
  const r = Math.round(255 * c[4 * i]);
  const g = Math.round(255 * c[4 * i + 1]);
  const b = Math.round(255 * c[4 * i + 2]);
  const a = c[4 * i + 3];
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

interface StateProps {
  columnarViewModel: ColumnarViewModel;
  animationDuration: number;
  chartDimensions: Size;
  a11ySettings: A11ySettings;
  tooltipRequired: boolean;
  onElementOver: NonNullable<SettingsSpec['onElementOver']>;
  onElementClick: NonNullable<SettingsSpec['onElementClick']>;
  onElementOut: NonNullable<SettingsSpec['onElementOut']>;
  onRenderChange: NonNullable<SettingsSpec['onRenderChange']>;
}

interface OwnProps {
  containerRef: BackwardRef;
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type FlameProps = StateProps & OwnProps;

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
  private pointerX: number;
  private pointerY: number;
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
    this.pointerX = -10000;
    this.pointerY = -10000;
  }

  private inTween = (t: DOMHighResTimeStamp) =>
    this.drilldown.timestamp + this.props.animationDuration + TWEEN_EPSILON_MS >= t;

  componentDidMount = () => {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    this.drawCanvas();
  };

  componentDidUpdate = () => {
    if (!this.ctx) this.tryCanvasContext();
  };

  private getFocus = () => {
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
  };

  private getHoveredDatumIndex = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!this.props.forwardStageRef.current || !this.ctx || this.inTween(e.timeStamp)) return;

    const picker = this.glResources.readPixelXY;
    const focus = this.getFocus();
    const box = this.props.forwardStageRef.current.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const datumIndex = picker(x, y, focus);
    this.pointerX = x;
    this.pointerY = y;

    return { datumIndex, timestamp: e.timeStamp };
  };

  private handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const hovered = this.getHoveredDatumIndex(e);
    const prevHoverIndex = this.hoverIndex >= 0 ? this.hoverIndex : NaN; // todo instead of translating NaN/-1 back and forth, just convert to -1 for shader rendering
    if (hovered) {
      this.hoverIndex = Number.isNaN(hovered.datumIndex) ? DUMMY_INDEX : hovered.datumIndex;
      if (Number.isFinite(hovered.datumIndex) && !Object.is(this.hoverIndex, prevHoverIndex)) {
        this.props.onElementOver([{ vmIndex: hovered.datumIndex }]); // userland callback
      }
      this.setState({});
      this.drawCanvas(); // why is it also needed if there's setState?
    } else if (Number.isFinite(prevHoverIndex)) {
      this.hoverIndex = DUMMY_INDEX;
      this.props.onElementOut(); // userland callback
    }
  };

  private handleMouseClick = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const hovered = this.getHoveredDatumIndex(e);
    if (hovered) {
      this.prevDrilldown = this.drilldown;
      this.drilldown = hovered;
      this.hoverIndex = DUMMY_INDEX; // no highlight
      this.drawCanvas(); // consider switching to the less direct this.setState
      this.props.onElementClick([{ vmIndex: hovered.datumIndex }]); // userland callback
    }
  };

  private handleMouseLeave = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    this.hoverIndex = DUMMY_INDEX; // no highlight
    this.setState({});
    this.drawCanvas(); // why is it also needed if there's setState?
  };

  render = () => {
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
      cursor: this.hoverIndex >= 0 ? 'pointer' : DEFAULT_CSS_CURSOR,
    };
    const canvasWidth = width * this.devicePixelRatio;
    const canvasHeight = height * this.devicePixelRatio;
    const specValueFormatter = (d: number) => d;
    const columns = this.props.columnarViewModel;
    return (
      <>
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
            onMouseMove={this.handleMouseMove}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={this.handleMouseClick}
            onMouseLeave={this.handleMouseLeave}
            style={style}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
        </figure>
        <NakedTooltip
          onPointerMove={() => ({ type: ON_POINTER_MOVE, position: { x: NaN, y: NaN }, time: NaN })}
          position={{ x: this.pointerX, y: this.pointerY, width: 0, height: 0 }}
          visible={this.props.tooltipRequired && this.hoverIndex >= 0}
          info={{
            header: null,
            values:
              this.hoverIndex >= 0
                ? [
                    {
                      label: columns.label[this.hoverIndex],
                      color: getColor(columns.color, this.hoverIndex),
                      isHighlighted: false,
                      isVisible: true,
                      seriesIdentifier: { specId: '', key: '' },
                      value: columns.value[this.hoverIndex],
                      formattedValue: `${specValueFormatter(columns.value[this.hoverIndex])}`,
                      valueAccessor: this.hoverIndex,
                    },
                  ]
                : [],
          }}
          getChartContainerRef={this.props.containerRef}
        />
      </>
    );
  };

  private drawCanvas = () => {
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
          this.props.onRenderChange(true);
        }
      });
    }
  };

  private tryCanvasContext = () => {
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
  };
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const flameSpec = getSpecsFromStore<FlameSpec>(state.specs, ChartType.Flame, SpecType.Series)[0];
  const settingsSpec = getSettingsSpecSelector(state);
  return {
    columnarViewModel: flameSpec?.columnarData ?? nullColumnarViewModel,
    animationDuration: flameSpec?.animation.duration ?? 0,
    chartDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    tooltipRequired: getTooltipType(settingsSpec) !== TooltipType.None,

    // mandatory charts API protocol; todo extract these mappings once there are other charts like Flame
    onElementOver: settingsSpec.onElementOver ?? (() => {}),
    onElementClick: settingsSpec.onElementClick ?? (() => {}),
    onElementOut: settingsSpec.onElementOut ?? (() => {}),
    onRenderChange: settingsSpec.onRenderChange ?? (() => {}), // todo eventually also update data props on a local .echChartStatus element: data-ech-render-complete={rendered} data-ech-render-count={renderedCount}
    // todo add something for updating data-ech-debug-state={debugStateString} on a local .echChartStatus element
  };
};

const FlameChartLayers = connect(mapStateToProps)(FlameComponent);

/** @internal */
export const FlameWithTooltip = (containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) => (
  <FlameChartLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />
);
