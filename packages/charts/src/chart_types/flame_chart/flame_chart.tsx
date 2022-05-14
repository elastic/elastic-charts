/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createRef, CSSProperties, MouseEvent, RefObject, WheelEventHandler } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import {
  bindFramebuffer,
  createTexture,
  GL_READ_FRAMEBUFFER,
  NullTexture,
  readPixel,
  Texture,
} from '../../common/kingly';
import { BasicTooltip } from '../../components/tooltip/tooltip';
import { getTooltipType, SettingsSpec, SpecType, TooltipType } from '../../specs';
import { onChartRendered } from '../../state/actions/chart';
import { ON_POINTER_MOVE } from '../../state/actions/mouse';
import { BackwardRef, GlobalChartState } from '../../state/chart_state';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../state/utils';
import { clamp } from '../../utils/common';
import { Size } from '../../utils/dimensions';
import { FlameSpec } from './flame_api';
import { roundUpSize } from './render/common';
import { drawFrame } from './render/draw_a_frame';
import { ensureWebgl } from './render/ensure_webgl';
import { GEOM_INDEX_OFFSET } from './shaders';
import { GLResources, NULL_GL_RESOURCES, nullColumnarViewModel, PickFunction } from './types';

const PINCH_ZOOM_CHECK_INTERVAL_MS = 100;
const SIDE_OVERSHOOT_RATIO = 0.05; // e.g. 0.05 means, extend the domain 5% to the left and 5% to the right
const RECURRENCE_ALPHA_PER_MS_X = 0.01;
const RECURRENCE_ALPHA_PER_MS_Y = 0.01;
const SINGLE_CLICK_EMPTY_FOCUS = true;
const IS_META_REQUIRED_FOR_ZOOM = false;
const ZOOM_SPEED = 0.0015;
const DEEPEST_ZOOM_RATIO = 1e-7; // FP calcs seem precise enough down to a 10 000 000 times zoom: 1e-7

const unitRowPitch = (position: Float32Array) => (position.length >= 4 ? position[1] - position[3] : 1);
const initialPixelRowPitch = () => 16;
const specValueFormatter = (d: number) => d; // fixme use the formatter from the spec
const browserRootWindow = () => {
  let rootWindow = window; // we might be in an iframe, and visualViewport.scale is toplevel only
  while (window.parent && window.parent.window !== rootWindow) rootWindow = rootWindow.parent.window;
  return rootWindow;
};

const columnToRowPositions = ({ position1, size1 }: FlameSpec['columnarData'], i: number) => ({
  x0: position1[i * 2],
  x1: position1[i * 2] + size1[i],
  y0: position1[i * 2 + 1],
  y1: position1[i * 2 + 1] + unitRowPitch(position1),
});

interface FocusRect {
  timestamp: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const focusRect = (
  columnarViewModel: FlameSpec['columnarData'],
  chartHeight: number,
  drilldownDatumIndex: number,
  drilldownTimestamp: number,
): FocusRect => {
  const { x0, x1, y0, y1 } = columnToRowPositions(columnarViewModel, drilldownDatumIndex || 0);
  const sideOvershoot = SIDE_OVERSHOOT_RATIO * (x1 - x0);
  const unitHeight = (chartHeight / initialPixelRowPitch()) * (y1 - y0);
  const intendedY0 = y1 - unitHeight;
  const bottomOvershoot = Math.max(0, -intendedY0);
  const top = Math.min(1, y1 + bottomOvershoot);
  return {
    timestamp: drilldownTimestamp,
    x0: Math.max(0, x0 - sideOvershoot),
    x1: Math.min(1, x1 + sideOvershoot),
    y0: Math.max(0, intendedY0),
    y1: Math.min(1, top),
  };
};

const getColor = (c: Float32Array, i: number) => {
  const r = Math.round(255 * c[4 * i]);
  const g = Math.round(255 * c[4 * i + 1]);
  const b = Math.round(255 * c[4 * i + 2]);
  const a = c[4 * i + 3];
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const colorToDatumIndex = (pixel: Uint8Array) => {
  // this is the inverse of what's done via BIT_SHIFTERS in shader code (bijective color/index mapping)
  const isEmptyArea = pixel[0] + pixel[1] + pixel[2] + pixel[3] < GEOM_INDEX_OFFSET; // ie. zero
  return isEmptyArea ? NaN : pixel[3] + 256 * (pixel[2] + 256 * (pixel[1] + 256 * pixel[0])) - GEOM_INDEX_OFFSET;
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

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface OwnProps {
  containerRef: BackwardRef;
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type FlameProps = StateProps & DispatchProps & OwnProps;

class FlameComponent extends React.Component<FlameProps> {
  static displayName = 'Flame';

  // DOM API Canvas2d and WebGL resources
  private ctx: CanvasRenderingContext2D | null;
  private glContext: WebGL2RenderingContext | null;
  private pickTexture: Texture;
  private glResources: GLResources;
  private readonly glCanvasRef: RefObject<HTMLCanvasElement>;

  // native browser pinch zoom handling
  private pinchZoomSetInterval: number;
  private pinchZoomScale: number;

  // mouse coordinates for the tooltip
  private pointerX: number;
  private pointerY: number;

  // currently hovered over datum
  private hoverIndex: number;

  // drilldown animation
  private animationRafId: number;
  private prevT: number;
  private currentFocus: FocusRect;
  private targetFocus: FocusRect;

  // panning
  private startOfDragX: number = NaN;
  private startOfDragX0: number = NaN;
  private startOfDragY: number = NaN;
  private startOfDragY0: number = NaN;

  constructor(props: Readonly<FlameProps>) {
    super(props);
    this.ctx = null;
    this.glContext = null;
    this.pickTexture = NullTexture;
    this.glResources = NULL_GL_RESOURCES;
    this.glCanvasRef = createRef();
    this.animationRafId = NaN;
    this.prevT = NaN;
    this.currentFocus = focusRect(this.props.columnarViewModel, props.chartDimensions.height, 0, -Infinity);
    this.targetFocus = { ...this.currentFocus };
    this.hoverIndex = NaN;
    this.pointerX = -10000;
    this.pointerY = -10000;

    // browser pinch zoom handling
    this.pinchZoomSetInterval = NaN;
    this.pinchZoomScale = browserRootWindow().visualViewport.scale;
    this.setupViewportScaleChangeListener();
  }

  private setupDevicePixelRatioChangeListener = () => {
    // redraw if the devicePixelRatio changed, for example:
    //   - applied browser zoom from the browser's top right hamburger menu (NOT the pinch zoom)
    //   - changed monitor resolution
    //   - dragged the browser to a monitor with a differing devicePixelRatio
    window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
      'change',
      () => {
        this.setState({});
        // this re-adds the `once` event listener (not sure if componentDidMount guarantees single execution)
        // and the value in the `watchMedia` resolution needs to change as well
        this.setupDevicePixelRatioChangeListener();
      },
      { once: true },
    );
  };

  private setupViewportScaleChangeListener = () => {
    window.clearInterval(this.pinchZoomSetInterval);
    this.pinchZoomSetInterval = window.setInterval(() => {
      const pinchZoomScale = browserRootWindow().visualViewport.scale; // not cached, to avoid holding a reference to a `window` object
      if (pinchZoomScale !== this.pinchZoomScale) {
        this.pinchZoomScale = pinchZoomScale;
        this.setState({});
      }
    }, PINCH_ZOOM_CHECK_INTERVAL_MS);
  };

  componentDidMount = () => {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    this.drawCanvas();
    this.props.onChartRendered();
    this.setupDevicePixelRatioChangeListener();
    this.props.containerRef().current?.addEventListener('wheel', this.preventScroll, { passive: false });
  };

  componentWillUnmount() {
    this.props.containerRef().current?.removeEventListener('wheel', this.preventScroll);
  }

  componentDidUpdate = () => {
    if (!this.ctx) this.tryCanvasContext();
    this.ensurePickTexture();
    this.drawCanvas(); // eg. due to chartDimensions (parentDimensions) change
    // this.props.onChartRendered() // creates and infinite update loop
  };

  private datumAtXY: PickFunction = (x, y) =>
    this.glContext ? colorToDatumIndex(readPixel(this.glContext, x, y)) : NaN;

  private updatePointerLocation(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent> | React.WheelEvent<Element>,
  ) {
    if (!this.props.forwardStageRef.current || !this.ctx) return;
    const box = this.props.forwardStageRef.current.getBoundingClientRect();
    this.pointerX = e.clientX - box.left;
    this.pointerY = e.clientY - box.top;
  }

  private getHoveredDatumIndex = (e: MouseEvent<HTMLCanvasElement>) => {
    const pr = window.devicePixelRatio * this.pinchZoomScale;
    return {
      datumIndex: this.datumAtXY(pr * this.pointerX, pr * (this.props.chartDimensions.height - this.pointerY)),
      timestamp: e.timeStamp,
    };
  };

  private getDragDistanceX = () => this.pointerX - this.startOfDragX;
  private getDragDistanceY = () => -(this.pointerY - this.startOfDragY);

  private handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    this.updatePointerLocation(e);
    const isLeftButtonHeld = e.buttons & 1;
    if (isLeftButtonHeld) {
      const { x0, x1, y0, y1 } = this.currentFocus;
      const focusWidth = x1 - x0; // this stays constant during panning
      const focusHeight = y1 - y0; // this stays constant during panning
      if (Number.isNaN(this.startOfDragX0)) this.startOfDragX0 = x0;
      if (Number.isNaN(this.startOfDragY0)) this.startOfDragY0 = y0;
      const dragDistanceX = this.getDragDistanceX();
      const dragDistanceY = this.getDragDistanceY();
      const { width: chartWidth, height: chartHeight } = this.props.chartDimensions;
      const deltaIntentX = (-dragDistanceX / chartWidth) * focusWidth;
      const deltaIntentY = (-dragDistanceY / chartHeight) * focusHeight;
      const deltaCorrectionX =
        deltaIntentX > 0
          ? Math.min(0, 1 - (this.startOfDragX0 + focusWidth + deltaIntentX))
          : -Math.min(0, this.startOfDragX0 + deltaIntentX);
      const deltaCorrectionY =
        deltaIntentY > 0
          ? Math.min(0, 1 - (this.startOfDragY0 + focusHeight + deltaIntentY))
          : -Math.min(0, this.startOfDragY0 + deltaIntentY);
      const deltaX = deltaIntentX + deltaCorrectionX; // todo allow a bit of overdrag: use 0.95-0.98 times deltaCorrectionX and snap back on mouseup
      const deltaY = deltaIntentY + deltaCorrectionY; // todo allow a bit of overdrag: use 0.95-0.98 times deltaCorrectionX and snap back on mouseup
      const newX0 = clamp(this.startOfDragX0 + deltaX, 0, 1); // to avoid negligible FP domain breaches
      const newX1 = clamp(this.startOfDragX0 + focusWidth + deltaX, 0, 1); // to avoid negligible FP domain breaches
      const newY0 = clamp(this.startOfDragY0 + deltaY, 0, 1); // to avoid negligible FP domain breaches
      const newY1 = clamp(this.startOfDragY0 + focusHeight + deltaY, 0, 1); // to avoid negligible FP domain breaches
      const newFocus = { x0: newX0, x1: newX1, y0: newY0, y1: newY1, timestamp: e.timeStamp };
      this.currentFocus = newFocus;
      this.targetFocus = newFocus;
      this.hoverIndex = NaN; // it's disturbing to have a tooltip while zooming/panning
      this.setState({});
    } else {
      const hovered = this.getHoveredDatumIndex(e);
      const prevHoverIndex = this.hoverIndex >= 0 ? this.hoverIndex : NaN; // todo instead of translating NaN/-1 back and forth, just convert to -1 for shader rendering
      if (hovered) {
        this.hoverIndex = hovered.datumIndex;
        if (!Object.is(this.hoverIndex, prevHoverIndex)) {
          if (Number.isFinite(hovered.datumIndex)) {
            this.props.onElementOver([{ vmIndex: hovered.datumIndex }]); // userland callback
          } else {
            this.hoverIndex = NaN;
            this.props.onElementOut(); // userland callback
          }
        }
        this.setState({}); // exact tooltip location needs an update
      }
    }
  };

  private clearDrag = () => {
    this.startOfDragX = NaN;
    this.startOfDragX0 = NaN;
    this.startOfDragY = NaN;
    this.startOfDragY0 = NaN;
  };

  private resetDrag = () => {
    this.startOfDragX = this.pointerX;
    this.startOfDragY = this.pointerY;
  };

  private handleMouseDown = () => {
    this.resetDrag();
  };

  private handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    this.updatePointerLocation(e); // just in case: eg. the user tabbed away, moved mouse elsewhere, and came back
    const dragDistanceX = this.getDragDistanceX(); // zero or NaN means that a non-zero drag didn't happen
    const dragDistanceY = this.getDragDistanceY(); // zero or NaN means that a non-zero drag didn't happen
    if (!dragDistanceX && !dragDistanceY) {
      const hovered = this.getHoveredDatumIndex(e);
      const isDoubleClick = e.detail > 1;
      const hasClickedOnRectangle = Number.isFinite(hovered?.datumIndex);
      const mustFocus = SINGLE_CLICK_EMPTY_FOCUS || isDoubleClick !== hasClickedOnRectangle; // xor: either double-click on empty space, or single-click on a node
      if (mustFocus) {
        this.targetFocus = focusRect(
          this.props.columnarViewModel,
          this.props.chartDimensions.height,
          hovered.datumIndex,
          hovered.timestamp,
        );
        this.prevT = NaN;
        this.hoverIndex = NaN; // no highlight
        this.setState({});
        this.props.onElementClick([{ vmIndex: hovered.datumIndex }]); // userland callback
      }
    }
    this.clearDrag();
  };

  private handleMouseLeave = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (Number.isFinite(this.hoverIndex)) {
      this.hoverIndex = NaN; // no highlight when outside
      this.setState({}); // no tooltip when outside
    }
  };

  private preventScroll = (e: WheelEvent) => e.metaKey === IS_META_REQUIRED_FOR_ZOOM && e.preventDefault();

  private handleWheel: WheelEventHandler = (e) => {
    if (e.metaKey !== IS_META_REQUIRED_FOR_ZOOM) return; // one way: zoom; other way: let scroll happen

    this.updatePointerLocation(e);
    const { x0, x1, y0, y1 } = this.currentFocus;
    const wheelDelta = -e.deltaY; // mapbox convention: scroll down increases magnification
    const delta = wheelDelta * ZOOM_SPEED;

    const unitX = this.pointerX / this.props.chartDimensions.width;
    const unitY = (this.props.chartDimensions.height - this.pointerY) / this.props.chartDimensions.height;
    const midX = x0 + unitX * Math.abs(x1 - x0);
    const midY = y0 + unitY * Math.abs(y1 - y0);
    const targetX0 = clamp(x0 - delta * (x0 - midX), 0, 1);
    const targetX1 = clamp(x1 + delta * (midX - x1), 0, 1);
    const targetY0 = clamp(y0 - delta * (y0 - midY), 0, 1);
    const targetY1 = clamp(y1 + delta * (midY - y1), 0, 1);
    const newX0 = Math.min(targetX0, midX); // to prevent lo/hi values from switching places
    const newX1 = Math.max(targetX1, midX); // to prevent lo/hi values from switching places
    const newY0 = Math.min(targetY0, midY); // to prevent lo/hi values from switching places
    const newY1 = Math.max(targetY1, midY); // to prevent lo/hi values from switching places

    const xZoom = (e.ctrlKey || !e.altKey) && newX1 - newX0 >= DEEPEST_ZOOM_RATIO;
    const yZoom = (e.ctrlKey || e.altKey) && newY1 - newY0 >= unitRowPitch(this.props.columnarViewModel.position1);

    if (xZoom || yZoom) {
      const newFocus = {
        x0: xZoom ? newX0 : x0,
        x1: xZoom ? newX1 : x1,
        y0: yZoom ? newY0 : y0,
        y1: yZoom ? newY1 : y1,
        timestamp: e.timeStamp,
      };
      this.currentFocus = newFocus;
      this.targetFocus = newFocus;
    }

    this.hoverIndex = NaN; // it's disturbing to have a tooltip while zooming/panning
    this.setState({});
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
      cursor: this.hoverIndex >= 0 ? 'pointer' : DEFAULT_CSS_CURSOR,
    };
    const dpr = window.devicePixelRatio * this.pinchZoomScale;
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;
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
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onMouseLeave={this.handleMouseLeave}
            onWheel={this.handleWheel}
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
    if (!this.ctx || !this.glContext || !this.pickTexture) return;

    const renderFrame = drawFrame(
      this.ctx,
      this.glContext,
      this.props.chartDimensions.width,
      this.props.chartDimensions.height,
      window.devicePixelRatio * this.pinchZoomScale,
      this.props.columnarViewModel,
      this.pickTexture,
      this.glResources.pickTextureRenderer,
      this.glResources.roundedRectRenderer,
      this.hoverIndex,
      unitRowPitch(this.props.columnarViewModel.position1),
    );

    const anim = (t: DOMHighResTimeStamp) => {
      const msDeltaT = Number.isNaN(this.prevT) ? 0 : t - this.prevT;
      this.prevT = t;

      const dx0 = this.targetFocus.x0 - this.currentFocus.x0;
      const dx1 = this.targetFocus.x1 - this.currentFocus.x1;
      const dy0 = this.targetFocus.y0 - this.currentFocus.y0;
      const dy1 = this.targetFocus.y1 - this.currentFocus.y1;

      const currentExtentX = this.currentFocus.x1 - this.currentFocus.x0;
      const currentExtentY = this.currentFocus.y1 - this.currentFocus.y0;

      const relativeExpansionX = Math.max(1, (currentExtentX + dx1 - dx0) / currentExtentX);
      const relativeExpansionY = Math.max(1, (currentExtentX + dy1 - dy0) / currentExtentY);

      const convergenceRateX = Math.min(1, msDeltaT * RECURRENCE_ALPHA_PER_MS_X) / relativeExpansionX;
      const convergenceRateY = Math.min(1, msDeltaT * RECURRENCE_ALPHA_PER_MS_Y) / relativeExpansionY;

      this.currentFocus.x0 += convergenceRateX * dx0;
      this.currentFocus.x1 += convergenceRateX * dx1;
      this.currentFocus.y0 += convergenceRateY * dy0;
      this.currentFocus.y1 += convergenceRateY * dy1;

      renderFrame([this.currentFocus.x0, this.currentFocus.x1, this.currentFocus.y0, this.currentFocus.y1]);

      const maxDiff = Math.max(Math.abs(dx0), Math.abs(dx1), Math.abs(dy0), Math.abs(dy1));
      if (maxDiff > 1e-12) this.animationRafId = window.requestAnimationFrame(anim);
    };
    window.cancelAnimationFrame(this.animationRafId);
    this.animationRafId = window.requestAnimationFrame(anim);

    this.props.onRenderChange(true); // emit API callback
  };

  private ensurePickTexture = () => {
    const { width, height } = this.props.chartDimensions;
    const pr = window.devicePixelRatio * this.pinchZoomScale;
    const textureWidth = pr * width;
    const textureHeight = pr * height;
    const current = this.pickTexture;
    if (
      this.glContext &&
      (current === NullTexture || current.width !== textureWidth || current.height !== textureHeight)
    ) {
      // (re)create texture
      current.delete();
      this.pickTexture =
        createTexture(this.glContext, {
          textureIndex: 0,
          width: textureWidth,
          height: textureHeight,
          internalFormat: this.glContext.RGBA8,
          data: null,
        }) ?? NullTexture;
      bindFramebuffer(this.glContext, GL_READ_FRAMEBUFFER, this.pickTexture.target());
    }
  };

  private tryCanvasContext = () => {
    const canvas = this.props.forwardStageRef.current;
    const glCanvas = this.glCanvasRef.current;

    this.ctx = canvas && canvas.getContext('2d');
    this.glContext = glCanvas && glCanvas.getContext('webgl2');

    this.ensurePickTexture();

    if (this.glContext && this.glResources === NULL_GL_RESOURCES) {
      this.glResources = ensureWebgl(this.glContext, this.props.columnarViewModel);
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

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const FlameChartLayers = connect(mapStateToProps, mapDispatchToProps)(FlameComponent);

/** @internal */
export const FlameWithTooltip = (containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) => (
  <FlameChartLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />
);
