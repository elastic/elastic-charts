/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createRef, CSSProperties, RefObject, WheelEventHandler } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { FlameSpec } from './flame_api';
import { NavigationStrategy, NavButtonControlledZoomPanHistory } from './navigation';
import { roundUpSize } from './render/common';
import { drawFrame, EPSILON, PADDING_BOTTOM, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP } from './render/draw_a_frame';
import { ensureWebgl } from './render/ensure_webgl';
import { uploadToWebgl } from './render/upload_to_webgl';
import { attributeLocations, GEOM_INDEX_OFFSET } from './shaders';
import { GLResources, NULL_GL_RESOURCES, nullColumnarViewModel, PickFunction } from './types';
import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR, SECONDARY_BUTTON } from '../../common/constants';
import { bindFramebuffer, createTexture, NullTexture, readPixel, Texture } from '../../common/kingly';
import { GL } from '../../common/webgl_constants';
import { BasicTooltip } from '../../components/tooltip/tooltip';
import { SettingsSpec, SpecType, TooltipType, TooltipValue } from '../../specs';
import { onChartRendered } from '../../state/actions/chart';
import { ON_POINTER_MOVE } from '../../state/actions/mouse';
import { BackwardRef, GlobalChartState } from '../../state/chart_state';
import { isPinnableTooltip } from '../../state/selectors/can_pin_tooltip';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../state/selectors/get_tooltip_spec';
import { getSpecsFromStore } from '../../state/utils';
import { clamp, isFiniteNumber, isNil } from '../../utils/common';
import { Size } from '../../utils/dimensions';
import { FlamegraphStyle } from '../../utils/themes/theme';

const PINCH_ZOOM_CHECK_INTERVAL_MS = 100;
const SIDE_OVERSHOOT_RATIO = 0.05; // e.g. 0.05 means, extend the domain 5% to the left and 5% to the right
const RECURRENCE_ALPHA_PER_MS_X = 0.01;
const RECURRENCE_ALPHA_PER_MS_Y = 0.0062;
const SINGLE_CLICK_EMPTY_FOCUS = true;
const IS_META_REQUIRED_FOR_ZOOM = false;
const ZOOM_SPEED = 0.0015;
const DEEPEST_ZOOM_RATIO = 1e-7; // FP calcs seem precise enough down to a 10 000 000 times zoom: 1e-7
const ZOOM_FROM_EDGE_BAND = 16; // so the user needs not be precisely at the edge to zoom in one direction
const ZOOM_FROM_EDGE_BAND_LEFT = ZOOM_FROM_EDGE_BAND + PADDING_LEFT;
const ZOOM_FROM_EDGE_BAND_RIGHT = ZOOM_FROM_EDGE_BAND + PADDING_RIGHT;
const ZOOM_FROM_EDGE_BAND_TOP = ZOOM_FROM_EDGE_BAND + PADDING_TOP;
const ZOOM_FROM_EDGE_BAND_BOTTOM = ZOOM_FROM_EDGE_BAND + PADDING_BOTTOM;
const LEFT_MOUSE_BUTTON = 1;
const MINIMAP_SIZE_RATIO_X = 3;
const MINIMAP_SIZE_RATIO_Y = 3;
const SHOWN_ANCESTOR_COUNT = 2; // how many rows above the focused in node should be shown
const SHOULD_DISABLE_WOBBLE = (typeof process === 'object' && process.env && process.env.VRT) === 'true';
const WOBBLE_DURATION = SHOULD_DISABLE_WOBBLE ? 0 : 1000;
const WOBBLE_REPEAT_COUNT = 2;
const WOBBLE_FREQUENCY = SHOULD_DISABLE_WOBBLE ? 0 : 2 * Math.PI * (WOBBLE_REPEAT_COUNT / WOBBLE_DURATION); // e.g. 1/30 means a cycle of every 30ms
const NODE_TWEEN_DURATION_MS = 500;

const unitRowPitch = (position: Float32Array) => (position.length >= 4 ? (position[1] ?? 0) - (position[3] ?? 0) : 1);
const initialPixelRowPitch = () => 16;
const specValueFormatter = (d: number) => d; // fixme use the formatter from the spec

/**
 * Returns top-level `window` when inside iframe
 */
const browserRootWindow = () => {
  let rootWindow = window;
  while (window.parent && window.parent.window !== rootWindow) rootWindow = rootWindow.parent.window;
  return rootWindow;
};

const columnToRowPositions = ({ position1, size1 }: FlameSpec['columnarData'], i: number) => ({
  x0: position1[i * 2] ?? 0,
  x1: (position1[i * 2] ?? 0) + (size1[i] ?? 0),
  y0: position1[i * 2 + 1] ?? 0,
  y1: (position1[i * 2 + 1] ?? 0) + unitRowPitch(position1),
});

/** @internal */
export interface FocusRect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const focusForArea = (chartHeight: number, { x0, x1, y0, y1 }: { x0: number; x1: number; y0: number; y1: number }) => {
  // horizontal
  const sideOvershoot = SIDE_OVERSHOOT_RATIO * (x1 - x0);

  // vertical
  const unitRowHeight = y1 - y0;
  const chartHeightInUnit = (chartHeight / initialPixelRowPitch()) * unitRowHeight;
  const y = Math.min(1, y1 + unitRowHeight * SHOWN_ANCESTOR_COUNT);
  const intendedY0 = y - chartHeightInUnit;
  const bottomOvershoot = Math.max(0, -intendedY0);
  const top = Math.min(1, y + bottomOvershoot);

  return {
    x0: Math.max(0, x0 - sideOvershoot),
    x1: Math.min(1, x1 + sideOvershoot),
    y0: Math.max(0, intendedY0),
    y1: Math.min(1, top),
  };
};

const focusRect = (
  columnarViewModel: FlameSpec['columnarData'],
  chartHeight: number,
  drilldownDatumIndex: number,
): FocusRect => focusForArea(chartHeight, columnToRowPositions(columnarViewModel, drilldownDatumIndex || 0));

const getColor = (c: Float32Array, i: number) => {
  const r = Math.round(255 * (c[4 * i] ?? 0));
  const g = Math.round(255 * (c[4 * i + 1] ?? 0));
  const b = Math.round(255 * (c[4 * i + 2] ?? 0));
  const a = c[4 * i + 3];
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const colorToDatumIndex = (pixel: Uint8Array) => {
  // this is the inverse of what's done via BIT_SHIFTERS in shader code (bijective color/index mapping)
  const [p0 = 0, p1 = 0, p2 = 0, p3 = 0] = pixel;
  const isEmptyArea = p0 + p1 + p2 + p3 < GEOM_INDEX_OFFSET; // ie. zero
  return isEmptyArea ? NaN : p3 + 256 * (p2 + 256 * (p1 + 256 * p0)) - GEOM_INDEX_OFFSET;
};

const getRegExp = (searchString: string): RegExp => {
  let regex: RegExp;
  try {
    regex = new RegExp(searchString);
  } catch {
    return new RegExp('iIUiUYIuiGjhG678987gjhgfytr678576'); // todo find a quick failing regex
  }
  return regex;
};

const isAttributeKey = (keyCandidate: string): keyCandidate is keyof typeof attributeLocations =>
  keyCandidate in attributeLocations;

interface StateProps {
  theme: FlamegraphStyle;
  debugHistory: boolean;
  columnarViewModel: FlameSpec['columnarData'];
  controlProviderCallback: FlameSpec['controlProviderCallback'];
  animationDuration: number;
  chartDimensions: Size;
  a11ySettings: ReturnType<typeof getA11ySettingsSelector>;
  tooltipRequired: boolean;
  canPinTooltip: boolean;
  search: NonNullable<FlameSpec['search']>;
  onSeachTextChange: (text: string) => void;
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

/** @internal */
export type NavRect = FocusRect & { index: number };

class FlameComponent extends React.Component<FlameProps> {
  static displayName = 'Flame';

  // DOM API Canvas2d and WebGL resources
  private ctx: CanvasRenderingContext2D | null = null;
  private glContext: WebGL2RenderingContext | null = null;
  private pickTexture: Texture = NullTexture;
  private glResources: GLResources = NULL_GL_RESOURCES;
  private readonly glCanvasRef: RefObject<HTMLCanvasElement> = createRef();

  // native browser pinch zoom handling
  private pinchZoomSetInterval: number = NaN;
  private pinchZoomScale: number = 1;

  // mouse coordinates for the tooltip
  private pointerX: number = NaN;
  private pointerY: number = NaN;

  // mouse coordinates for pinned tooltip
  private pinnedPointerX: number = NaN;
  private pinnedPointerY: number = NaN;

  // pinned tooltip state
  private tooltipPinned: boolean = false;
  private tooltipSelectedSeries: TooltipValue[] = [];

  // currently hovered over datum
  private hoverIndex: number = NaN;
  private tooltipValues: TooltipValue[] = [];

  // drilldown animation
  private animationRafId: number = NaN;
  private prevFocusTime: number = NaN;
  private prevNodeTweenTime: number = NaN;
  private currentFocus: FocusRect;
  private targetFocus: FocusRect;

  // panning
  private startOfDragX: number = NaN;
  private startOfDragY: number = NaN;
  private startOfDragFocusLeft: number = NaN;
  private startOfDragFocusTop: number = NaN; // todo top or bottom...does it even matter?

  // text search
  private readonly searchInputRef: RefObject<HTMLInputElement> = createRef();
  private currentSearchString = '';
  private currentSearchHitCount = 0;
  private currentColor: Float32Array;
  private caseSensitive = false;
  private useRegex = false;
  private focusedMatchIndex = NaN;

  // wobble
  private wobbleTimeLeft = 0;
  private wobbleIndex = NaN;

  // navigation
  private navigator: NavigationStrategy;

  constructor(props: Readonly<FlameProps>) {
    super(props);
    const columns = this.props.columnarViewModel;

    // vector length checks
    const datumCount = columns.position1.length / 2;
    if (datumCount % 1) throw new Error('flame error: position1 vector must have even values (x/y pairs)');
    if (datumCount * 2 !== columns.position0.length)
      throw new Error('flame error: Mismatch between position0 (xy) and position1 (xy) length');
    if (datumCount !== columns.size0.length)
      throw new Error('flame error: Mismatch between position1 (xy) and size0 length');
    if (datumCount !== columns.size1.length)
      throw new Error('flame error: Mismatch between position1 (xy) and size1 length');
    if (datumCount * 4 !== columns.color.length)
      throw new Error('flame error: Mismatch between position1 (xy) and color (rgba) length');
    if (datumCount !== columns.value.length)
      throw new Error('flame error: Mismatch between position1 (xy) and value length');
    if (datumCount !== columns.label.length)
      throw new Error('flame error: Mismatch between position1 (xy) and label length');

    this.targetFocus = this.getFocusOnRoot();

    this.bindControls();
    this.currentFocus = { ...this.targetFocus };

    // Initialize nav queue with the root element
    this.navigator = new NavButtonControlledZoomPanHistory({ ...this.getFocusOnRoot(), index: 0 });

    // browser pinch zoom handling
    this.pinchZoomSetInterval = NaN;

    try {
      // if in an iframe we need the top-level `visualViewport`
      if (browserRootWindow().visualViewport) {
        // Only setup listener if access to `visualViewport` is allowed
        this.setupViewportScaleChangeListener();
      }
    } catch {
      // unable to access `window.visualViewport`
    }

    // search
    this.currentColor = columns.color;

    // node size/position tween time
    this.prevNodeTweenTime =
      columns.position0 === columns.position1 && columns.size0 === columns.size1 ? -Infinity : Infinity; // if nothing to tween, then skip it
  }

  private pinTooltip = (pinned: boolean): void => {
    if (!pinned) {
      this.unpinTooltip(true);
      return;
    }

    this.tooltipPinned = true;
    this.tooltipSelectedSeries = this.tooltipValues;
    // this.setState({});
  };

  private toggleSelectedTooltipItem = (tooltipValue: TooltipValue): void => {
    // selection is arbitrary for flame elements - just toggle single selection
    if (!this.tooltipPinned) return;
    this.tooltipSelectedSeries = this.tooltipSelectedSeries.length === 0 ? [tooltipValue] : [];
    this.setState({});
  };

  private setSelectedTooltipItems = (tooltipValues: TooltipValue[]): void => {
    this.tooltipSelectedSeries = tooltipValues;
    this.setState({});
  };

  private focusOnNavElement(element?: NavRect) {
    if (!element) {
      return;
    }
    if (isFiniteNumber(element.index)) {
      this.focusOnNode(element.index);
    } else {
      this.focusOnRect(element);
    }
  }

  private bindControls() {
    const { controlProviderCallback } = this.props;
    if (controlProviderCallback.resetFocus) {
      controlProviderCallback.resetFocus(() => this.resetFocus());
    }
    if (controlProviderCallback.focusOnNode) {
      controlProviderCallback.focusOnNode((nodeIndex: number) => {
        const rect = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, nodeIndex);
        this.navigator.add({ ...rect, index: nodeIndex });
        this.focusOnNode(nodeIndex);
      });
    }
    if (controlProviderCallback.search) {
      controlProviderCallback.search((text: string) => {
        if (!this.searchInputRef.current) return;
        this.searchInputRef.current.value = text;
        this.searchForText(false);
      });
    }
  }

  private resetFocus() {
    this.navigator.reset();
    this.targetFocus = this.getFocusOnRoot();
    this.wobble(0);
  }

  private focusOnNode(nodeIndex: number) {
    this.targetFocus = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, nodeIndex);
    this.wobble(nodeIndex);
  }

  private focusOnRect(rect: FocusRect) {
    this.targetFocus = rect;
    this.setState({});
  }

  private wobble(nodeIndex: number) {
    this.wobbleTimeLeft = WOBBLE_DURATION;
    this.wobbleIndex = nodeIndex;
    this.prevFocusTime = NaN;
    this.hoverIndex = NaN; // no highlight
    this.setState({});
  }

  private getFocusOnRoot() {
    return focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, 0);
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

  /**
   * Setup interval to update pinch zoom scale factor
   *
   * Note: method accesses `window.visualViewport`
   */
  private setupViewportScaleChangeListener = () => {
    window.clearInterval(this.pinchZoomSetInterval);
    this.pinchZoomSetInterval = window.setInterval(() => {
      const pinchZoomScale = browserRootWindow().visualViewport?.scale ?? 1;
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

    if (this.props.search.text.length > 0 && this.searchInputRef.current) {
      this.searchInputRef.current.value = this.props.search.text;
      this.searchForText(false);
    }

    this.drawCanvas();
    this.props.onChartRendered();
    this.setupDevicePixelRatioChangeListener();
    this.props.containerRef().current?.addEventListener('wheel', this.preventScroll, { passive: false });
  };

  componentWillUnmount() {
    this.props.containerRef().current?.removeEventListener('wheel', this.preventScroll);
  }

  private ensureTextureAndDraw = () => {
    this.ensurePickTexture();
    this.drawCanvas();
  };

  private chartDimensionsChanged({ height, width }: Size): boolean {
    return this.props.chartDimensions.height !== height || this.props.chartDimensions.width !== width;
  }

  componentDidUpdate = ({ chartDimensions, search }: FlameProps) => {
    if (!this.ctx) this.tryCanvasContext();
    if (this.tooltipPinned && this.chartDimensionsChanged(chartDimensions)) {
      this.unpinTooltip();
    }
    this.bindControls();
    if (search.text !== this.props.search.text && this.searchInputRef.current) {
      this.searchInputRef.current.value = this.props.search.text;
      this.searchForText(false);
    }

    this.ensureTextureAndDraw();

    // eg. due to chartDimensions (parentDimensions) change
    // this.props.onChartRendered() // creates and infinite update loop
  };

  private pointerInMinimap = (x: number, y: number) =>
    x === clamp(x, this.getMinimapLeft(), this.getMinimapLeft() + this.getMinimapWidth()) &&
    y === clamp(y, this.getMinimapTop(), this.getMinimapTop() + this.getMinimapHeight());

  private datumAtXY: PickFunction = (x, y) =>
    this.glContext ? colorToDatumIndex(readPixel(this.glContext, x, y)) : NaN;

  private updatePointerLocation(e: { clientX: number; clientY: number }) {
    if (!this.props.forwardStageRef.current || !this.ctx) return;
    const box = this.props.forwardStageRef.current.getBoundingClientRect();
    this.pointerX = e.clientX - box.left;
    this.pointerY = e.clientY - box.top;

    if (!this.tooltipPinned) {
      this.pinnedPointerX = this.pointerX;
      this.pinnedPointerY = this.pointerY;
    }
  }

  private unpinTooltip(redraw = false) {
    this.pinnedPointerX = NaN;
    this.pinnedPointerY = NaN;
    this.tooltipPinned = false;
    this.tooltipSelectedSeries = [];
    this.updateHoverIndex();
    if (redraw) {
      this.smartDraw();
    }
  }

  private getHoveredDatumIndex = () => {
    const pr = window.devicePixelRatio * this.pinchZoomScale;
    const x = this.tooltipPinned ? this.pinnedPointerX : this.pointerX;
    const y = this.tooltipPinned ? this.pinnedPointerY : this.pointerY;
    return this.datumAtXY(pr * x, pr * (this.props.chartDimensions.height - y));
  };

  private getDragDistanceX = () => this.pointerX - this.startOfDragX;
  private getDragDistanceY = () => -(this.pointerY - this.startOfDragY);
  private isDragging = ({ buttons }: { buttons: number }) => buttons & LEFT_MOUSE_BUTTON;

  private handleMouseHoverMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!this.isDragging(e)) {
      e.stopPropagation();
      this.updatePointerLocation(e);
      if (!this.tooltipPinned) {
        this.updateHoverIndex();
      }
    }
  };

  private updateHoverIndex() {
    const hoveredDatumIndex = this.getHoveredDatumIndex();
    const prevHoverIndex = this.hoverIndex >= 0 ? this.hoverIndex : NaN;
    this.hoverIndex = hoveredDatumIndex;
    if (!Object.is(this.hoverIndex, prevHoverIndex)) {
      if (Number.isFinite(hoveredDatumIndex)) {
        this.props.onElementOver([{ vmIndex: hoveredDatumIndex }]); // userland callback
      } else {
        this.hoverIndex = NaN;
        this.props.onElementOut(); // userland callback
      }
    }

    if (prevHoverIndex !== this.hoverIndex) {
      const columns = this.props.columnarViewModel;
      const hoverValue = this.hoverIndex >= 0 ? columns.value[this.hoverIndex] : null;
      this.tooltipValues = !isNil(hoverValue)
        ? [
            {
              label: columns.label[this.hoverIndex] ?? '',
              color: getColor(columns.color, this.hoverIndex),
              isHighlighted: false,
              isVisible: true,
              seriesIdentifier: { specId: '', key: '' },
              value: hoverValue,
              formattedValue: `${specValueFormatter(hoverValue)}`,
              valueAccessor: this.hoverIndex,
            },
          ]
        : [];
    }
    this.setState({}); // exact tooltip location needs an update
  }

  private handleMouseDragMove = (e: MouseEvent) => {
    e.stopPropagation();
    this.updatePointerLocation(e);

    if (this.isDragging(e)) {
      const dragInMinimap = this.pointerInMinimap(this.startOfDragX, this.startOfDragY);
      const focusMoveDirection = dragInMinimap ? 1 : -1; // focus box moves in direction of drag: positive; opposite: negative
      const { x0, x1, y0, y1 } = this.currentFocus;
      const focusWidth = x1 - x0; // this stays constant during panning
      const focusHeight = y1 - y0; // this stays constant during panning
      if (Number.isNaN(this.startOfDragFocusLeft)) this.startOfDragFocusLeft = x0;
      if (Number.isNaN(this.startOfDragFocusTop)) this.startOfDragFocusTop = y0;
      const dragDistanceX = this.getDragDistanceX();
      const dragDistanceY = this.getDragDistanceY();
      const { width: chartWidth, height: chartHeight } = this.props.chartDimensions;
      const focusChartWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
      const focusChartHeight = chartHeight - PADDING_TOP - PADDING_BOTTOM;
      const dragSpeedX = (dragInMinimap ? MINIMAP_SIZE_RATIO_X / focusWidth : 1) / focusChartWidth;
      const dragSpeedY = (dragInMinimap ? MINIMAP_SIZE_RATIO_Y / focusHeight : 1) / focusChartHeight;
      const deltaIntentX = focusMoveDirection * dragDistanceX * dragSpeedX * focusWidth;
      const deltaIntentY = focusMoveDirection * dragDistanceY * dragSpeedY * focusHeight;
      const deltaCorrectionX =
        deltaIntentX > 0
          ? Math.min(0, 1 - (this.startOfDragFocusLeft + focusWidth + deltaIntentX))
          : -Math.min(0, this.startOfDragFocusLeft + deltaIntentX);
      const deltaCorrectionY =
        deltaIntentY > 0
          ? Math.min(0, 1 - (this.startOfDragFocusTop + focusHeight + deltaIntentY))
          : -Math.min(0, this.startOfDragFocusTop + deltaIntentY);
      const deltaX = deltaIntentX + deltaCorrectionX; // todo allow a bit of overdrag: use 0.95-0.98 times deltaCorrectionX and snap back on mouseup
      const deltaY = deltaIntentY + deltaCorrectionY; // todo allow a bit of overdrag: use 0.95-0.98 times deltaCorrectionX and snap back on mouseup
      const newX0 = clamp(this.startOfDragFocusLeft + deltaX, 0, 1); // to avoid negligible FP domain breaches
      const newX1 = clamp(this.startOfDragFocusLeft + focusWidth + deltaX, 0, 1); // to avoid negligible FP domain breaches
      const newY0 = clamp(this.startOfDragFocusTop + deltaY, 0, 1); // to avoid negligible FP domain breaches
      const newY1 = clamp(this.startOfDragFocusTop + focusHeight + deltaY, 0, 1); // to avoid negligible FP domain breaches
      const newFocus = { x0: newX0, x1: newX1, y0: newY0, y1: newY1 };
      this.currentFocus = newFocus;
      this.targetFocus = newFocus;
      this.navigator.add({ ...newFocus, index: NaN });
      this.smartDraw();
    }
  };

  private clearDrag = () => {
    this.startOfDragX = NaN;
    this.startOfDragY = NaN;
    this.startOfDragFocusLeft = NaN;
    this.startOfDragFocusTop = NaN;
  };

  private resetDrag = () => {
    this.startOfDragX = this.pointerX;
    this.startOfDragY = this.pointerY;
  };

  private handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (e.button === SECONDARY_BUTTON || e.ctrlKey) return; // context menu click
    if (Number.isNaN(this.pointerX + this.pointerY)) return; // don't reset from minimap
    if (this.tooltipPinned) return; // prevent dragging while tooltip is pinned

    this.resetDrag();

    window.addEventListener('mousemove', this.handleMouseDragMove, { passive: true });
    window.addEventListener('mouseup', this.handleMouseUp, { passive: true });
  };

  private handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    e.preventDefault(); // prevent browser context menu

    if (this.tooltipPinned) {
      this.handleUnpinningTooltip();
      return;
    }
    if (!Number.isFinite(this.getHoveredDatumIndex())) {
      // NOP if not hover a node
      return;
    }
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('click', this.handleUnpinningTooltip);
    window.addEventListener('visibilitychange', this.handleUnpinningTooltip);
    this.pinTooltip(true);
    this.setState({}); // updates cursor
  };

  private handleMouseUp = (e: MouseEvent) => {
    e.stopPropagation();

    window.removeEventListener('mousemove', this.handleMouseDragMove);
    window.removeEventListener('mouseup', this.handleMouseUp);

    if (this.tooltipPinned) {
      this.unpinTooltip();
      this.clearDrag();
      return;
    }

    this.updatePointerLocation(e); // just in case: eg. the user tabbed away, moved mouse elsewhere, and came back
    const dragDistanceX = this.getDragDistanceX(); // zero or NaN means that a non-zero drag didn't happen
    const dragDistanceY = this.getDragDistanceY(); // zero or NaN means that a non-zero drag didn't happen
    if (!dragDistanceX && !dragDistanceY) {
      const hoveredDatumIndex = this.getHoveredDatumIndex();
      const isDoubleClick = e.detail > 1;
      const hasClickedOnRectangle = Number.isFinite(hoveredDatumIndex);
      const mustFocus = SINGLE_CLICK_EMPTY_FOCUS || isDoubleClick !== hasClickedOnRectangle; // xor: either double-click on empty space, or single-click on a node
      const isContextClick = e.button === SECONDARY_BUTTON || e.ctrlKey;

      if (mustFocus && !isContextClick && !this.pointerInMinimap(this.pointerX, this.pointerY)) {
        const rect = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, hoveredDatumIndex);
        this.navigator.add({ ...rect, index: hoveredDatumIndex });
        this.focusOnNode(hoveredDatumIndex);
        this.props.onElementClick([{ vmIndex: hoveredDatumIndex }]); // userland callback
      }
    }
    this.clearDrag();
    this.setState({});
  };

  private handleUnpinningTooltip = () => {
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('click', this.handleUnpinningTooltip);
    window.removeEventListener('visibilitychange', this.handleUnpinningTooltip);
    this.pinTooltip(false);
  };

  static watchedKeys: KeyboardEvent['key'][] = ['Escape'];
  private handleKeyUp = ({ key }: KeyboardEvent) => {
    if (!FlameComponent.watchedKeys.includes(key)) return;

    window.removeEventListener('keyup', this.handleKeyUp);

    this.unpinTooltip();
  };

  private handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (!this.tooltipPinned) {
      this.smartDraw();
    }
  };

  private preventScroll = (e: WheelEvent) => e.metaKey === IS_META_REQUIRED_FOR_ZOOM && e.preventDefault();

  private handleWheel: WheelEventHandler = (e) => {
    if (e.metaKey !== IS_META_REQUIRED_FOR_ZOOM) return; // one way: zoom; other way: let scroll happen

    this.unpinTooltip();
    this.updatePointerLocation(e);

    const { x0, x1, y0, y1 } = this.currentFocus;
    const wheelDelta = -e.deltaY; // mapbox convention: scroll down increases magnification
    const delta = wheelDelta * ZOOM_SPEED;

    const unitX = this.pointerX / this.props.chartDimensions.width;
    const unitY = (this.props.chartDimensions.height - this.pointerY) / this.props.chartDimensions.height;
    const zoomOut = delta <= 0;
    const midX =
      Math.abs(x0) < EPSILON && (zoomOut || this.pointerX < ZOOM_FROM_EDGE_BAND_LEFT)
        ? 0
        : Math.abs(x1 - 1) < EPSILON &&
            (zoomOut || this.pointerX > this.props.chartDimensions.width - ZOOM_FROM_EDGE_BAND_RIGHT)
          ? 1
          : clamp(x0 + unitX * Math.abs(x1 - x0), 0, 1);
    const midY =
      Math.abs(y0) < EPSILON &&
      (zoomOut || this.pointerY > this.props.chartDimensions.height - ZOOM_FROM_EDGE_BAND_BOTTOM)
        ? 0
        : Math.abs(y1 - 1) < EPSILON && (zoomOut || this.pointerY < ZOOM_FROM_EDGE_BAND_TOP)
          ? 1
          : clamp(y0 + unitY * Math.abs(y1 - y0), 0, 1);
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
      };
      this.navigator.add({ ...newFocus, index: NaN });
      this.currentFocus = newFocus;
      this.targetFocus = newFocus;
    }
    this.smartDraw();
  };

  private focusOnAllMatches = () => {
    this.currentSearchHitCount = 0;
    const searchString = this.currentSearchString;
    const customizedSearchString = this.caseSensitive ? searchString : searchString.toLowerCase();
    const regex = this.useRegex && getRegExp(searchString);
    const columns = this.props.columnarViewModel;
    this.currentColor = new Float32Array(columns.color);
    const labels = columns.label;
    const size = columns.size1;
    const position = columns.position1;
    const rowHeight = unitRowPitch(position);
    const datumCount = labels.length;
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;

    // todo unify with matcher loop and setup in focusOnHit
    for (let i = 0; i < datumCount; i++) {
      const label = this.caseSensitive ? labels[i] : labels[i]?.toLowerCase();
      if (regex ? label?.match(regex) : label?.includes(customizedSearchString)) {
        this.currentSearchHitCount++;
        x0 = Math.min(x0, position[2 * i] ?? 0);
        x1 = Math.max(x1, (position[2 * i] ?? 0) + (size[i] ?? 0));
        y0 = Math.min(y0, position[2 * i + 1] ?? 0);
        y1 = Math.max(y1, (position[2 * i + 1] ?? 0) + rowHeight);
      } else if (this.currentColor[4 * i + 3] !== undefined) {
        this.currentColor[4 * i + 3]! *= 0.25; // multiply alpha
      }
    }

    if (Number.isFinite(x0) && searchString.length > 0) {
      Object.assign(this.targetFocus, focusForArea(this.props.chartDimensions.height, { x0, x1, y0, y1 }));
      // disabled for now, reintroduce it if we want to include it into the history nav
      // this.navigator.add({ ...this.targetFocus, index: NaN });
    }
  };

  private uploadSearchColors = () => {
    const colorSetter = this.glResources.attributes.get('color');
    if (this.glContext && colorSetter && this.currentColor.length === this.props.columnarViewModel.color.length) {
      uploadToWebgl(this.glContext, new Map([['color', colorSetter]]), { color: this.currentColor });
    }
  };

  private searchForText = (force: boolean) => {
    const input = this.searchInputRef.current;
    const searchString = input?.value;
    if (!input || typeof searchString !== 'string' || (searchString === this.currentSearchString && !force)) return;
    this.currentSearchString = searchString;

    // update focus rectangle if needed
    this.focusOnAllMatches();

    // update colors
    this.uploadSearchColors();

    // render
    this.focusedMatchIndex = NaN;
    this.setState({});
  };

  private handleEnterKey = (e: React.KeyboardEvent<HTMLCanvasElement | HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        this.previousHit();
      } else {
        this.nextHit();
      }
      return true;
    }
    return false;
  };

  private clearSearchText = () => {
    if (!this.searchInputRef.current) return;
    this.searchInputRef.current.value = '';
    this.searchForText(false);
  };

  private handleEscapeKey = (e: React.KeyboardEvent<HTMLCanvasElement | HTMLInputElement>) => {
    if (e.key === 'Escape') {
      this.clearSearchText();
    }
  };

  private handleSearchFieldKeyPress = (e: React.KeyboardEvent<HTMLCanvasElement | HTMLInputElement>) => {
    if (this.handleEnterKey(e)) {
      e.stopPropagation();
    }
  };

  private focusOnHit = () => {
    if (Number.isNaN(this.focusedMatchIndex)) {
      // resetting to focus on everything
      this.focusOnAllMatches();
    } else {
      let datumIndex = NaN;
      let hitEnumerator = -1;
      const searchString = this.currentSearchString;
      const customizedSearchString = this.caseSensitive ? searchString : searchString.toLowerCase();
      const regex = this.useRegex && getRegExp(searchString);
      const labels = this.props.columnarViewModel.label;
      // todo unify with matcher loop and setup in focusOnAllMatches
      for (let i = 0; i < labels.length; i++) {
        const label = this.caseSensitive ? labels[i] : labels[i]?.toLowerCase();
        if (regex ? label?.match(regex) : label?.includes(customizedSearchString)) {
          datumIndex = i;
          hitEnumerator++;
          if (hitEnumerator === this.focusedMatchIndex) break;
        }
      }
      if (hitEnumerator >= 0) {
        this.targetFocus = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, datumIndex);
        // disable until we consider that part of the navigation
        // this.navigator.add({ ...this.targetFocus, index: NaN });
        this.prevFocusTime = NaN;
        this.hoverIndex = NaN; // no highlight
        this.wobbleTimeLeft = WOBBLE_DURATION;
        this.wobbleIndex = datumIndex;
      }
    }
  };

  private previousHit = () => {
    const hitCount = this.currentSearchHitCount;
    if (!this.currentSearchString || hitCount === 0) return;
    this.focusedMatchIndex = Number.isNaN(this.focusedMatchIndex)
      ? hitCount - 1
      : this.focusedMatchIndex === 0
        ? NaN
        : this.focusedMatchIndex - 1;
    this.focusOnHit();
    this.setState({});
  };

  private nextHit = () => {
    const hitCount = this.currentSearchHitCount;
    if (!this.currentSearchString || hitCount === 0) return;
    this.focusedMatchIndex = this.focusedMatchIndex = Number.isNaN(this.focusedMatchIndex)
      ? 0
      : this.focusedMatchIndex === hitCount - 1
        ? NaN
        : this.focusedMatchIndex + 1;
    this.focusOnHit();
    this.setState({});
  };

  private getActiveCursor(): CSSProperties['cursor'] {
    if (this.tooltipPinned) return DEFAULT_CSS_CURSOR;
    if (this.startOfDragX) return 'grabbing';
    if (this.hoverIndex >= 0) return 'pointer';
    return 'grab';
  }

  render = () => {
    const {
      forwardStageRef,
      chartDimensions: { width: requestedWidth, height: requestedHeight },
      a11ySettings,
      debugHistory,
      theme,
      canPinTooltip,
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
      cursor: this.getActiveCursor(),
    };

    const dpr = window.devicePixelRatio * this.pinchZoomScale;
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;
    const hitCount = this.currentSearchHitCount;

    const {
      textColor,
      buttonDisabledTextColor,
      buttonBackgroundColor,
      buttonDisabledBackgroundColor,
      buttonTextColor,
    } = theme.navigation;

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
            tabIndex={0}
            className="echCanvasRenderer"
            width={canvasWidth}
            height={canvasHeight}
            onMouseMove={this.handleMouseHoverMove}
            onMouseDown={this.handleMouseDown}
            onContextMenu={canPinTooltip ? this.handleContextMenu : undefined}
            onMouseLeave={this.handleMouseLeave}
            onKeyPress={this.handleEnterKey}
            onKeyUp={this.handleEscapeKey}
            onWheel={this.handleWheel}
            style={{ ...style, outline: 'none' }}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
        </figure>
        <div
          style={{
            position: 'absolute',
            transform: `translateY(${this.props.chartDimensions.height - PADDING_BOTTOM + 4}px)`,
          }}
        >
          <label
            title="Navigate back"
            style={{
              color: this.navigator.canNavBackward() ? buttonTextColor : buttonDisabledTextColor,
              fontWeight: 500,
              marginLeft: 16,
              marginRight: 4,
              borderRadius: 4,
              paddingInline: 4,
              width: 18,
              display: 'inline-block',
              height: 16,
              verticalAlign: 'middle',
              textAlign: 'center',
              backgroundColor: this.navigator.canNavBackward() ? buttonBackgroundColor : buttonDisabledBackgroundColor,
            }}
          >
            ᐸ
            <input
              type="button"
              tabIndex={0}
              onClick={() => this.focusOnNavElement(this.navigator.navBackward())}
              style={{ display: 'none' }}
            />
          </label>
          <label
            title="Reset"
            style={{
              color: buttonTextColor,
              fontWeight: 500,
              paddingInline: 4,
              borderRadius: 4,
              verticalAlign: 'middle',
              backgroundColor: buttonBackgroundColor,
            }}
          >
            ▲
            <input type="button" tabIndex={0} onClick={() => this.resetFocus()} style={{ display: 'none' }} />
          </label>
          <label
            title="Navigate forward"
            style={{
              color: this.navigator.canNavForward() ? buttonTextColor : buttonDisabledTextColor,
              fontWeight: 500,
              marginLeft: 4,
              marginRight: 16,
              borderRadius: 4,
              paddingInline: 4,
              verticalAlign: 'middle',
              backgroundColor: this.navigator.canNavForward() ? buttonBackgroundColor : buttonDisabledBackgroundColor,
            }}
          >
            ᐳ
            <input
              type="button"
              tabIndex={0}
              onClick={() => this.focusOnNavElement(this.navigator.navForward())}
              style={{ display: 'none' }}
            />
          </label>
          <input
            ref={this.searchInputRef}
            title="Search string or regex pattern"
            size={16}
            type="text"
            tabIndex={0}
            placeholder="Search string"
            onKeyPress={this.handleSearchFieldKeyPress}
            onKeyUp={this.handleEscapeKey}
            onChange={(e) => {
              this.searchForText(false);
              this.props.onSeachTextChange(e.currentTarget.value);
            }}
            style={{
              border: 'none',
              padding: 3,
              outline: 'none',
              color: textColor,
              background: 'transparent',
            }}
          />
          <label
            title="Clear text"
            style={{
              color: buttonTextColor,
              background: buttonBackgroundColor,
              fontWeight: 500,
              paddingInline: 4,
              marginInline: 4,
              borderRadius: 4,
              opacity: this.currentSearchString ? 1 : 0,
              transition: 'opacity 250ms ease-in-out',
            }}
          >
            Clear
            <input
              type="button"
              tabIndex={0}
              onClick={() => {
                if (this.currentSearchString && this.searchInputRef.current) {
                  this.clearSearchText();
                  this.props.onSeachTextChange('');
                }
              }}
              style={{ display: 'none' }}
            />
          </label>

          <label
            title="Case sensitivity (highlighted: case sensitive)"
            style={{
              backgroundColor:
                this.caseSensitive && !this.useRegex ? buttonBackgroundColor : buttonDisabledBackgroundColor,
              color: this.caseSensitive && !this.useRegex ? buttonTextColor : buttonDisabledTextColor,
              fontWeight: 500,
              paddingInline: 4,
              marginInline: 4,
              borderRadius: 4,
              opacity: this.currentSearchString ? 1 : 0,
              transition: 'opacity 250ms ease-in-out',
            }}
          >
            Cc
            <input
              type="button"
              tabIndex={0}
              onClick={() => {
                if (!this.currentSearchString) return;
                this.caseSensitive = !this.caseSensitive;
                this.searchForText(true);
              }}
              style={{ display: 'none' }}
            />
          </label>
          <label
            title="Regex matching (highlighted: use regex)"
            style={{
              color: this.useRegex ? buttonTextColor : buttonDisabledTextColor,
              backgroundColor: this.useRegex ? buttonBackgroundColor : buttonDisabledBackgroundColor,
              fontWeight: 500,
              paddingInline: 4,
              marginInline: 4,
              borderRadius: 4,
              opacity: this.currentSearchString ? 1 : 0,
              transition: 'opacity 250ms ease-in-out',
            }}
          >
            . *
            <input
              type="button"
              tabIndex={0}
              onClick={() => {
                if (!this.currentSearchString) return;
                this.useRegex = !this.useRegex;
                this.searchForText(true);
              }}
              style={{ display: 'none' }}
            />
          </label>
          <label
            title="Previous hit"
            style={{
              backgroundColor: hitCount ? buttonBackgroundColor : buttonDisabledBackgroundColor,
              color: hitCount ? buttonTextColor : buttonDisabledTextColor,
              fontWeight: 500,
              marginLeft: 16,
              marginRight: 4,
              paddingInline: 4,
              borderRadius: 4,
              opacity: this.currentSearchString ? 1 : 0,
              transition: 'opacity 250ms ease-in-out',
              verticalAlign: 'middle',
            }}
          >
            ◀
            <input type="button" tabIndex={0} onClick={this.previousHit} style={{ display: 'none' }} />
          </label>
          <label
            title="Next hit"
            style={{
              backgroundColor: hitCount ? buttonBackgroundColor : buttonDisabledBackgroundColor,
              color: hitCount ? buttonTextColor : buttonDisabledTextColor,
              fontWeight: 500,
              paddingInline: 4,
              borderRadius: 4,
              opacity: this.currentSearchString ? 1 : 0,
              transition: 'opacity 250ms ease-in-out',
              verticalAlign: 'middle',
            }}
          >
            ▶
            <input type="button" tabIndex={0} onClick={this.nextHit} style={{ display: 'none' }} />
          </label>

          <p
            style={{
              float: 'right',
              padding: 3,
              opacity: this.currentSearchString ? 1 : 0,
              transition: 'opacity 250ms ease-in-out',
              color: textColor,
            }}
          >
            {`Match${Number.isNaN(this.focusedMatchIndex) ? 'es:' : `: ${this.focusedMatchIndex + 1} /`} ${hitCount}`}
          </p>
        </div>
        <BasicTooltip
          canPinTooltip={canPinTooltip}
          onPointerMove={() => ({ type: ON_POINTER_MOVE, position: { x: NaN, y: NaN }, time: NaN })}
          position={
            this.tooltipPinned
              ? { x: this.pinnedPointerX, y: this.pinnedPointerY, width: 0, height: 0 }
              : { x: this.pointerX, y: this.pointerY, width: 0, height: 0 }
          }
          pinned={this.tooltipPinned}
          selected={this.tooltipSelectedSeries}
          pinTooltip={this.pinTooltip}
          toggleSelectedTooltipItem={this.toggleSelectedTooltipItem}
          setSelectedTooltipItems={this.setSelectedTooltipItems}
          visible={
            this.tooltipPinned || (this.props.tooltipRequired && this.hoverIndex >= 0 && !(this.wobbleTimeLeft > 0))
          }
          info={{
            header: null,
            values: this.tooltipValues,
          }}
          getChartContainerRef={this.props.containerRef}
        />
        {debugHistory && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(20px, 20px)`,
              background: 'beige',
              opacity: 0.8,
            }}
          >
            history:
            <ul>
              {this.navigator.queue().map((d, i) => {
                return (
                  <li key={`${d.index}-${i}`}>{`${Number.isNaN(d.index) ? 'ZOOM/PAN' : d.index}${
                    this.navigator.index() === i ? '⬅' : ''
                  }`}</li>
                );
              })}
            </ul>
          </div>
        )}
      </>
    );
  };

  private smartDraw() {
    // avoids an unnecessary setState for high frequency interactions once the tooltip is off
    if (Number.isFinite(this.hoverIndex)) {
      this.hoverIndex = NaN; // it's disturbing to have a tooltip while zooming/panning
      this.setState({});
    } else {
      this.drawCanvas();
    }
  }

  private drawCanvas = () => {
    if (!this.ctx || !this.glContext || !this.pickTexture) return;

    const renderFrame = drawFrame(
      this.ctx,
      this.glContext,
      this.props.chartDimensions.width,
      this.props.chartDimensions.height,
      this.getMinimapWidth(),
      this.getMinimapHeight(),
      this.getMinimapLeft(),
      this.getMinimapTop(),
      window.devicePixelRatio * this.pinchZoomScale,
      this.props.columnarViewModel,
      this.pickTexture,
      this.glResources.pickTextureRenderer,
      this.glResources.roundedRectRenderer,
      this.hoverIndex,
      unitRowPitch(this.props.columnarViewModel.position1),
      this.currentColor,
      this.props.theme,
    );

    const anim = (t: DOMHighResTimeStamp) => {
      const focusTimeDeltaMs = Number.isNaN(this.prevFocusTime) ? 0 : t - this.prevFocusTime;
      this.prevFocusTime = t;

      if (this.prevNodeTweenTime === Infinity) this.prevNodeTweenTime = t;
      const nodeTweenTime = clamp((t - this.prevNodeTweenTime) / NODE_TWEEN_DURATION_MS, 0, 1);
      const nodeTweenInProgress = nodeTweenTime < 1;

      const dx0 = this.targetFocus.x0 - this.currentFocus.x0;
      const dx1 = this.targetFocus.x1 - this.currentFocus.x1;
      const dy0 = this.targetFocus.y0 - this.currentFocus.y0;
      const dy1 = this.targetFocus.y1 - this.currentFocus.y1;

      const currentExtentX = this.currentFocus.x1 - this.currentFocus.x0;
      const currentExtentY = this.currentFocus.y1 - this.currentFocus.y0;

      const relativeExpansionX = Math.max(1, (currentExtentX + dx1 - dx0) / currentExtentX);
      const relativeExpansionY = Math.max(1, (currentExtentX + dy1 - dy0) / currentExtentY);
      const jointRelativeExpansion = (relativeExpansionX + relativeExpansionY) / 2;

      const convergenceRateX = Math.min(1, focusTimeDeltaMs * RECURRENCE_ALPHA_PER_MS_X) / jointRelativeExpansion;
      const convergenceRateY = Math.min(1, focusTimeDeltaMs * RECURRENCE_ALPHA_PER_MS_Y) / jointRelativeExpansion;

      this.currentFocus.x0 += convergenceRateX * dx0;
      this.currentFocus.x1 += convergenceRateX * dx1;
      this.currentFocus.y0 += convergenceRateY * dy0;
      this.currentFocus.y1 += convergenceRateY * dy1;

      this.wobbleTimeLeft -= focusTimeDeltaMs;
      const wobbleAnimationInProgress = this.wobbleTimeLeft > 0;
      const timeFromWobbleStart = clamp(WOBBLE_DURATION - this.wobbleTimeLeft, 0, WOBBLE_DURATION);

      renderFrame(
        [this.currentFocus.x0, this.currentFocus.x1, this.currentFocus.y0, this.currentFocus.y1],
        this.wobbleIndex,
        wobbleAnimationInProgress ? 0.01 + 0.99 * (0.5 - 0.5 * Math.cos(timeFromWobbleStart * WOBBLE_FREQUENCY)) : 0, // positive if it must wobble
        nodeTweenTime,
      );

      const maxDiff = Math.max(Math.abs(dx0), Math.abs(dx1), Math.abs(dy0), Math.abs(dy1));
      const focusAnimationInProgress = maxDiff > 1e-12;
      if (focusAnimationInProgress || wobbleAnimationInProgress || nodeTweenInProgress) {
        this.animationRafId = window.requestAnimationFrame(anim);
      } else {
        this.prevFocusTime = NaN;
        this.currentFocus.x0 = this.targetFocus.x0;
        this.currentFocus.x1 = this.targetFocus.x1;
        this.currentFocus.y0 = this.targetFocus.y0;
        this.currentFocus.y1 = this.targetFocus.y1;
      }
    };
    window.cancelAnimationFrame(this.animationRafId);
    this.animationRafId = window.requestAnimationFrame(anim);

    this.props.onRenderChange(true); // emit API callback
  };

  private getMinimapWidth = () => this.props.chartDimensions.width / MINIMAP_SIZE_RATIO_X;
  private getMinimapHeight = () => this.props.chartDimensions.height / MINIMAP_SIZE_RATIO_Y;
  private getMinimapLeft = () => this.props.chartDimensions.width - this.getMinimapWidth();
  private getMinimapTop = () => this.props.chartDimensions.height - this.getMinimapHeight();

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
          internalFormat: GL.RGBA8,
          data: null,
        }) ?? NullTexture;
      bindFramebuffer(this.glContext, GL.READ_FRAMEBUFFER, this.pickTexture.target());
    }
  };

  private initializeGL = (gl: WebGL2RenderingContext) => {
    this.glResources = ensureWebgl(gl, Object.keys(this.props.columnarViewModel).filter(isAttributeKey));
    uploadToWebgl(gl, this.glResources.attributes, this.props.columnarViewModel);
  };

  private restoreGL = (gl: WebGL2RenderingContext) => {
    this.initializeGL(gl);
    this.pickTexture = NullTexture;
    this.uploadSearchColors();
    this.ensureTextureAndDraw();
  };

  private tryCanvasContext = () => {
    const canvas = this.props.forwardStageRef.current;
    const glCanvas = this.glCanvasRef.current;

    this.ctx = canvas && canvas.getContext('2d');
    this.glContext = glCanvas && glCanvas.getContext('webgl2');

    this.ensurePickTexture();

    if (glCanvas && this.glContext && this.glResources === NULL_GL_RESOURCES) {
      glCanvas.addEventListener('webglcontextlost', this.contextLossHandler, false);
      glCanvas.addEventListener('webglcontextrestored', this.contextRestoreHandler, false);

      this.initializeGL(this.glContext);
      // testContextLoss(this.glContext);
    }
  };

  private contextLossHandler = (event: { preventDefault: () => void }) => {
    // we could log it for telemetry etc todo add the option for a callback
    window.cancelAnimationFrame(this.animationRafId);
    event.preventDefault(); // this is needed for the context restoration callback to happen
  };

  private contextRestoreHandler = () => {
    // browser trivia: the duplicate calling of ensureContextAndInitialRender and changing/resetting the width are needed for Chrome and Safari to properly restore the context upon loss
    // we could log context loss/regain for telemetry etc todo add the option for a callback
    const glCanvas = this.glCanvasRef.current;
    if (!glCanvas || !this.glContext) return;
    this.restoreGL(this.glContext);
    const widthCss = glCanvas.style.width;
    const widthNum = parseFloat(widthCss);
    glCanvas.style.width = `${widthNum + 0.1}px`;
    window.setTimeout(() => {
      glCanvas.style.width = widthCss;
      if (this.glContext) this.restoreGL(this.glContext);
    }, 0);
  };
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const flameSpec = getSpecsFromStore<FlameSpec>(state.specs, ChartType.Flame, SpecType.Series)[0];
  const settingsSpec = getSettingsSpecSelector(state);
  const tooltipSpec = getTooltipSpecSelector(state);
  return {
    theme: getChartThemeSelector(state).flamegraph,
    debugHistory: settingsSpec.debug,
    columnarViewModel: flameSpec?.columnarData ?? nullColumnarViewModel,
    controlProviderCallback: flameSpec?.controlProviderCallback ?? {},
    animationDuration: flameSpec?.animation.duration ?? 0,
    chartDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    tooltipRequired: tooltipSpec.type !== TooltipType.None,
    canPinTooltip: isPinnableTooltip(state),
    search: flameSpec?.search ?? { text: '' },
    onSeachTextChange: flameSpec?.onSearchTextChange ?? (() => {}),
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
