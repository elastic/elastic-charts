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
import { BasicTooltip } from '../../components/tooltip/tooltip';
import { getTooltipType, SettingsSpec, SpecType, TooltipType } from '../../specs';
import { ON_POINTER_MOVE } from '../../state/actions/mouse';
import { BackwardRef, GlobalChartState } from '../../state/chart_state';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../state/utils';
import { Size } from '../../utils/dimensions';
import { FlameSpec } from './flame_api';
import { drawFrame } from './render/draw_a_frame';
import { ensureWebgl } from './render/ensure_webgl';
import { GEOM_INDEX_OFFSET } from './shaders';
import { AnimationState, GLResources, nullColumnarViewModel } from './types';

const TWEEN_EPSILON_MS = 20;
const DUMMY_INDEX = 0 - GEOM_INDEX_OFFSET - 1; // GLSL doesn't guarantee a NaN, and it's a shader integer anyway, so let's find a safe special number
const SIDE_OVERSHOOT_RATIO = 0.05; // e.g. 0.05 means, extend the domain 5% to the left and 5% to the right
const TOP_OVERSHOOT_ROW_COUNT = 2; // e.g. 2 means, try to render two extra rows above (parent and grandparent)

const linear = (x: number) => x;
const easeInOut = (alpha: number) => (x: number) => x ** alpha / (x ** alpha + (1 - x) ** alpha);
const rowHeight = (position: Float32Array) => (position.length >= 4 ? position[1] - position[3] : 1);

const columnToRowPositions = ({ position1, size1 }: FlameSpec['columnarData'], i: number) => ({
  x0: position1[i * 2],
  x1: position1[i * 2] + size1[i],
  y0: position1[i * 2 + 1],
  y1: position1[i * 2 + 1] + rowHeight(position1),
});

const focusRect = (
  columnarViewModel: FlameSpec['columnarData'],
  drilldownDatumIndex: number,
  drilldownTimestamp: number,
) => {
  if (Number.isNaN(drilldownDatumIndex)) return { x0: 0, y0: 0, x1: 1, y1: 1, timestamp: 0 };
  const { x0, x1, y1: rawY1 } = columnToRowPositions(columnarViewModel, drilldownDatumIndex);
  const sideOvershoot = SIDE_OVERSHOOT_RATIO * (x1 - x0);
  const topOvershoot = TOP_OVERSHOOT_ROW_COUNT * rowHeight(columnarViewModel.position1);
  const y1 = Math.min(1, rawY1 + topOvershoot);
  return {
    timestamp: drilldownTimestamp,
    x0: Math.max(0, x0 - sideOvershoot),
    x1: Math.min(1, x1 + sideOvershoot),
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
  columnarViewModel: FlameSpec['columnarData'];
  animationDuration: number;
  chartDimensions: Size;
  a11ySettings: ReturnType<typeof getA11ySettingsSelector>;
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
  private readonly glCanvasRef: RefObject<HTMLCanvasElement>;
  private animationState: AnimationState;
  private drilldownDatumIndex: number;
  private drilldownTimestamp: number;
  private prevDrilldownDatumIndex: number;
  private prevDrilldownTimestamp: number;
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
    this.drilldownDatumIndex = 0;
    this.drilldownTimestamp = -Infinity;
    this.prevDrilldownDatumIndex = 0;
    this.prevDrilldownTimestamp = -Infinity;
    this.hoverIndex = DUMMY_INDEX;
    this.pointerX = -10000;
    this.pointerY = -10000;
  }

  private inTween = (t: DOMHighResTimeStamp) =>
    this.drilldownTimestamp + this.props.animationDuration + TWEEN_EPSILON_MS >= t;

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
    this.drawCanvas(); // eg. due to chartDimensions (parentDimensions) change
  };

  private getFocus = () => {
    const { x0: currentFocusX0, y0: currentFocusY0, x1: currentFocusX1, y1: currentFocusY1, timestamp } = focusRect(
      this.props.columnarViewModel,
      this.drilldownDatumIndex,
      this.drilldownTimestamp,
    );
    const { x0: prevFocusX0, y0: prevFocusY0, x1: prevFocusX1, y1: prevFocusY1 } = focusRect(
      this.props.columnarViewModel,
      this.prevDrilldownDatumIndex,
      this.prevDrilldownTimestamp,
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
      this.drawCanvas(); // todo use setState properly which would also trigger drawCanvas
    } else if (Number.isFinite(prevHoverIndex)) {
      this.hoverIndex = DUMMY_INDEX;
      this.props.onElementOut(); // userland callback
    }
  };

  private handleMouseClick = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const hovered = this.getHoveredDatumIndex(e);
    if (hovered) {
      this.prevDrilldownDatumIndex = this.drilldownDatumIndex;
      this.prevDrilldownTimestamp = this.drilldownTimestamp;
      this.drilldownDatumIndex = hovered.datumIndex;
      this.drilldownTimestamp = hovered.timestamp;
      this.hoverIndex = DUMMY_INDEX; // no highlight
      this.setState({});
      this.drawCanvas(); // todo use setState properly which would also trigger drawCanvas
      this.props.onElementClick([{ vmIndex: hovered.datumIndex }]); // userland callback
    }
  };

  private handleMouseLeave = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (this.hoverIndex !== DUMMY_INDEX) {
      this.hoverIndex = DUMMY_INDEX; // no highlight when outside
      this.setState({}); // no tooltip when outside
      this.drawCanvas(); // todo use setState properly which would also trigger drawCanvas
    }
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
        <BasicTooltip
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
    window.requestAnimationFrame((t) => {
      if (!this.ctx || !this.glResources.gl || !this.glResources.pickTexture) return;

      const focus = this.getFocus();

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const timeFunction =
        this.props.animationDuration > 0 ? easeInOut(Math.min(5, this.props.animationDuration / 100)) : linear;

      const renderFrame = drawFrame(
        this.ctx,
        this.glResources.gl,
        focus,
        this.props.chartDimensions.width,
        this.props.chartDimensions.height,
        this.devicePixelRatio,
        this.glResources.columnarGeomData,
        this.glResources.pickTexture,
        this.glResources.pickTextureRenderer,
        this.glResources.roundedRectRenderer,
        this.hoverIndex,
      );

      window.cancelAnimationFrame(this.animationState.rafId); // todo consider deallocating/reallocating or ensuring resources upon cancellation
      if (this.props.animationDuration > 0 && this.inTween(t)) {
        renderFrame(0);
        const focusChanged = focus.currentFocusX0 !== focus.prevFocusX0 || focus.currentFocusX1 !== focus.prevFocusX1;
        if (focusChanged) {
          this.animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
            const anim = (t: number) => {
              const unitNormalizedTime = Math.max(0, (t - epochStartTime) / this.props.animationDuration);
              renderFrame(timeFunction(Math.min(1, unitNormalizedTime)));
              if (unitNormalizedTime <= 1) {
                this.animationState.rafId = window.requestAnimationFrame(anim);
              }
            };
            this.animationState.rafId = window.requestAnimationFrame(anim);
          });
        }
      } else {
        renderFrame(1);
      }

      this.props.onRenderChange(true);
    });
  };

  private tryCanvasContext = () => {
    const canvas = this.props.forwardStageRef.current;
    const glCanvas = this.glCanvasRef.current;
    this.ctx = canvas && canvas.getContext('2d');
    if (glCanvas) {
      this.glResources = ensureWebgl(
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
    onRenderChange: settingsSpec.onRenderChange ?? (() => {}), // todo eventually also update data props on a local .echChartStatus element: data-ech-render-complete={rendered} data-ech-render-count={renderedCount} data-ech-debug-state={debugStateString}
  };
};

const FlameChartLayers = connect(mapStateToProps)(FlameComponent);

/** @internal */
export const FlameWithTooltip = (containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) => (
  <FlameChartLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />
);
