/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  backgroundFillStyle,
  chartTopFontSize,
  config,
  defaultLabelFormat,
  defaultMinorTickLabelFormat,
  drawCartesianBox,
  fadeOutPixelWidth,
  horizontalCartesianAreaPad,
  keyPanVelocityDivisor,
  keyZoomVelocityDivisor,
  localeOptions,
  rasterConfig,
  timeZone,
  verticalCartesianAreaPad,
  wheelPanVelocity,
  wheelZoomVelocity,
  HORIZONTAL_AXIS,
  ZERO_Y_BASE,
} from './config';
import { getEnrichedData } from './data';
import type { DataState } from './data_fetch';
import { getNullDataState, invalid, updateDataState } from './data_fetch';
import { renderChartTitle } from './render/annotations/chart_title';
import { renderTimeExtentAnnotation } from './render/annotations/time_extent';
import { renderTimeUnitAnnotation } from './render/annotations/time_unit';
import { renderCartesian } from './render/cartesian';
import { renderDebugBox } from './render/glyphs/debug_box';
import type { FrameSurface } from '../../../renderers/frame_surface';
import type { Ctx2d } from '../../../renderers/painter';
import type { NumberFormatter } from '../../xy_chart/axes/timeslip/continuous_time_rasters';
import { continuousTimeRasters } from '../../xy_chart/axes/timeslip/continuous_time_rasters';
import { numericalRasters } from '../../xy_chart/axes/timeslip/numerical_rasters';
import { axisModel } from '../projections/axis_model';
import { domainTween } from '../projections/domain_tween';
import { getDesiredTickCount, makeLinearScale } from '../projections/scale';
import type { ZoomPan } from '../projections/zoom_pan';
import {
  doPanFromJumpDelta,
  doPanFromPosition,
  doZoomAroundPosition,
  doZoomFromJumpDelta,
  endDrag,
  getFocusDomain,
  initialZoomPan,
  kineticFlywheel,
  markDragStartPosition,
  multiplierToZoom,
  panOngoing,
  resetTouchZoom,
  startTouchZoom,
  touchOngoing,
} from '../projections/zoom_pan';
import type { GetData } from '../timeslip_api';
import { withAnimation, withDeltaTime } from '../utils/animation';
import type { ElementSize } from '../utils/dom';
import { elementSize, zoomSafePointerX, zoomSafePointerY } from '../utils/dom';
import type { Multitouch } from '../utils/multitouch';
import {
  continuedTwoPointTouch,
  eraseMultitouch,
  getPinchRatio,
  initialMultitouch,
  setNewMultitouch,
  touches,
  touchMidpoint,
  twoTouchPinch,
  zeroTouch,
} from '../utils/multitouch';

const HEADER_ROW_Y_OFFSET = 3; // 3 normal text height gap between unit/range annotation on top and the Cartesian area

const getNullDimensions = (): ElementSize => ({
  outerSize: NaN,
  innerLeading: NaN,
  innerTrailing: NaN,
  innerSize: NaN,
});

/** @internal */
export interface InteractionState {
  // remembering touch points for zoom/pam
  multitouch: Multitouch;

  // zoom/pan
  horizontalZoomPan: ZoomPan;

  // Y domain
  niceDomainMin: number;
  niceDomainMax: number;

  // other
  horizontalScreenDimensions: ElementSize;
  verticalScreenDimensions: ElementSize;
}

const getNullInteractionState = (): InteractionState => ({
  // current zoom and pan level

  horizontalZoomPan: initialZoomPan(),

  // remembering touch points for zoom/pam
  multitouch: initialMultitouch(),

  // Y domain
  niceDomainMin: NaN,
  niceDomainMax: NaN,

  // other
  horizontalScreenDimensions: getNullDimensions(),
  verticalScreenDimensions: getNullDimensions(),
});

const rasterSelector =
  HORIZONTAL_AXIS === 'continuousTime' ? continuousTimeRasters(rasterConfig, timeZone) : numericalRasters(rasterConfig);

const yTickNumberFormatter = new Intl.NumberFormat(
  config.locale,
  config.numUnit === 'none'
    ? {}
    : {
        notation: 'compact',
        compactDisplay: config.numUnit,
      },
);

const yTickNumberFormat: NumberFormatter = (value) => yTickNumberFormatter.format(value);

const touchUpdate = (interactionState: InteractionState, newMultitouch: Multitouch) => {
  const { multitouch, horizontalZoomPan: zoomPan, horizontalScreenDimensions } = interactionState;
  const noPreviousTouch = zeroTouch(multitouch);
  const isTwoTouchPinch = twoTouchPinch(newMultitouch);
  const center = touchMidpoint(newMultitouch);
  const isPinchStart = noPreviousTouch && isTwoTouchPinch;
  if (isPinchStart) {
    setNewMultitouch(multitouch, newMultitouch);
    startTouchZoom(zoomPan);
    markDragStartPosition(zoomPan, center);
  } else if (!isTwoTouchPinch || !continuedTwoPointTouch(multitouch, newMultitouch)) {
    eraseMultitouch(multitouch);
    resetTouchZoom(zoomPan);
  }
  const isPinchZoom = twoTouchPinch(multitouch);
  const isTouchOngoing = touchOngoing(zoomPan);
  const isPanOngoing = panOngoing(zoomPan);
  if (isPinchZoom) {
    const pinchRatio = getPinchRatio(multitouch, newMultitouch);
    const desiredZoomChange = multiplierToZoom(pinchRatio);
    doZoomAroundPosition(
      zoomPan,
      horizontalScreenDimensions,
      center,
      desiredZoomChange,
      0, // panFromPosition(center),
      true,
    );
    // doing both clashes in ways
    // doPanFromPosition(zoomPan, horizontalScreenDimensions.innerSize, center);
  } else {
    const inCartesianBand = true; // let's assume for now
    if (inCartesianBand || isTouchOngoing) {
      if (isPanOngoing) {
        doPanFromPosition(zoomPan, horizontalScreenDimensions.innerSize, center);
      } else {
        markDragStartPosition(zoomPan, center); // was dragStart(e)
      }
    }
  }
  return isPinchZoom || (isTouchOngoing && isPanOngoing);
};

const inCartesianBand = (size: ElementSize, value: number) => size.innerLeading <= value && value <= size.innerTrailing;

const doCartesian = (
  ctx: Ctx2d,
  cartesianHeight: number,
  interactionState: InteractionState,
  deltaT: number,
  cartesianWidth: number,
  timeDomain: { domainFrom: number; domainTo: number },
  dataState: DataState,
  emWidth: number,
) => {
  ctx.save();
  ctx.translate(0, cartesianHeight);

  const domainLandmarks = [
    dataState.dataResponse.stats.minValue,
    dataState.dataResponse.stats.maxValue,
    ...(ZERO_Y_BASE ? [0] : []),
  ];
  const desiredTickCount = getDesiredTickCount(cartesianHeight, config.smallFontSize, config.sparse);
  const { niceDomainMin, niceDomainMax, niceTicks } = axisModel(domainLandmarks, desiredTickCount);
  const yTweenOngoing = domainTween(interactionState, deltaT, niceDomainMin, niceDomainMax); // updates interactionState
  const yUnitScale = makeLinearScale(interactionState.niceDomainMin, interactionState.niceDomainMax, 0, 1);

  const dataDemand = renderCartesian(
    ctx,
    config,
    dataState,
    defaultMinorTickLabelFormat,
    emWidth,
    fadeOutPixelWidth,
    defaultLabelFormat,
    yTickNumberFormat,
    rasterSelector,
    cartesianWidth,
    cartesianHeight,
    timeDomain,
    yUnitScale,
    niceTicks,
  );

  ctx.restore();

  return { yTweenOngoing, dataDemand };
};

const renderChartWithTime = (
  ctx: Ctx2d,
  backgroundFillStyle: string,
  chartWidth: number,
  chartHeight: number,
  config: {
    locale: string;
    monospacedFontShorthand: string;
    subduedFontColor: string;
    defaultFontColor: string;
    a11y: { contrast: 'low' | 'medium' | 'high' };
  },
  cartesianTop: number,
  cartesianLeft: number,
  cartesianHeight: number,
  interactionState: InteractionState,
  deltaT: number,
  cartesianWidth: number,
  drawCartesianBox: boolean, // set to true for debug border around the Cartesian plot area
  chartTopFontSize: number,
  dataState: DataState,
  emWidth: number,
  fromSec: number,
  toSec: number,
) => {
  ctx.save();
  ctx.fillStyle = backgroundFillStyle;
  // clearRect is not enough, as browser image copy ignores canvas background color
  ctx.fillRect(0, 0, chartWidth, chartHeight);

  // chart title
  renderChartTitle(ctx, config.subduedFontColor, chartWidth /*, cartesianTop*/);

  ctx.translate(cartesianLeft, cartesianTop);

  const timeDomain = getFocusDomain(interactionState.horizontalZoomPan, fromSec, toSec);

  // cartesian
  const { yTweenOngoing, dataDemand } = doCartesian(
    ctx,
    cartesianHeight,
    interactionState,
    deltaT,
    cartesianWidth,
    timeDomain,
    dataState,
    emWidth,
  );

  // cartesian area box
  if (drawCartesianBox) {
    renderDebugBox(ctx, cartesianWidth, cartesianHeight);
  }

  const headerRowOffsetY = -chartTopFontSize * HEADER_ROW_Y_OFFSET;

  // chart time unit info
  renderTimeUnitAnnotation(
    ctx,
    config,
    dataDemand.binUnitCount,
    dataDemand.binUnit,
    chartTopFontSize,
    headerRowOffsetY,
    dataDemand.unitBarMaxWidthPixels,
  );

  // chart time from/to extent info
  renderTimeExtentAnnotation(ctx, config, localeOptions, timeDomain, cartesianWidth, headerRowOffsetY);

  ctx.restore();
  return { yTweenOngoing, dataDemand };
};

interface TimeslipConfig {
  locale: string;
  monospacedFontShorthand: string;
  subduedFontColor: string;
  defaultFontColor: string;
  a11y: { contrast: 'low' | 'medium' | 'high' };

  domainFrom: number;
  domainTo: number;
}

/** the chart and cartesian extents, from the css size of the stage element */
const layoutOf = (element: FrameSurface['element']) => ({
  horizontal: elementSize(element, true, horizontalCartesianAreaPad),
  vertical: elementSize(element, false, verticalCartesianAreaPad),
});

/** draws one frame into any context, advancing the tweens by `deltaT` */
const drawFrame = (
  ctx: Ctx2d,
  { horizontal, vertical }: ReturnType<typeof layoutOf>,
  config: TimeslipConfig,
  interactionState: InteractionState,
  dataState: DataState,
  deltaT: number,
  emWidth: number,
) => {
  interactionState.horizontalScreenDimensions = horizontal;
  interactionState.verticalScreenDimensions = vertical;
  return renderChartWithTime(
    ctx,
    backgroundFillStyle,
    horizontal.outerSize,
    vertical.outerSize,
    config,
    vertical.innerLeading,
    horizontal.innerLeading,
    vertical.innerSize,
    interactionState,
    deltaT,
    horizontal.innerSize,
    drawCartesianBox,
    chartTopFontSize,
    dataState,
    emWidth,
    config.domainFrom,
    config.domainTo,
  );
};

const chartWithTime = (
  surface: FrameSurface,
  config: TimeslipConfig,
  interactionState: InteractionState,
  dataState: DataState,
  deltaT: number,
  emWidth: number,
) => {
  const layout = layoutOf(surface.element);
  // render chart: the surface sizes itself for the frame and applies the device pixel ratio
  const ctx = surface.beginFrame(layout.horizontal.outerSize, layout.vertical.outerSize);
  const { yTweenOngoing, dataDemand } = drawFrame(ctx, layout, config, interactionState, dataState, deltaT, emWidth);
  surface.endFrame();

  const dataArrived =
    !dataState.pending &&
    invalid(dataState, dataDemand) &&
    dataDemand.lo &&
    dataDemand.hi &&
    dataDemand.binUnit &&
    dataDemand.binUnitCount;
  if (dataArrived) {
    dataState.pending = true;
  }
  return { dataArrived, yTweenOngoing, dataDemand };
};

const setupEventHandlers = (
  canvas: GlobalEventHandlers, // the stage element, canvas or svg
  interactionState: InteractionState,
  timedRender: FrameRequestCallback,
  scheduleChartRender: () => void,
) => {
  const wheel = (e: WheelEvent) => {
    // resolution and DOM dependent part
    const isPanning = e.metaKey;
    const wheeledDistanceRatio = e.deltaY / interactionState.horizontalScreenDimensions.innerSize; // for resolution independence
    if (!inCartesianBand(interactionState.verticalScreenDimensions, zoomSafePointerY(e))) return;

    // resolution independent part
    if (isPanning) {
      const innerSizeRelativeDelta = wheeledDistanceRatio * wheelPanVelocity;
      doPanFromJumpDelta(interactionState.horizontalZoomPan, -innerSizeRelativeDelta);
    } else {
      const desiredZoomChange = -wheeledDistanceRatio * wheelZoomVelocity;
      doZoomAroundPosition(
        interactionState.horizontalZoomPan,
        interactionState.horizontalScreenDimensions,
        zoomSafePointerX(e),
        desiredZoomChange,
        0,
        false,
      );
    }
    scheduleChartRender();
  };

  const dragStart = (e: MouseEvent) => markDragStartPosition(interactionState.horizontalZoomPan, zoomSafePointerX(e));

  const kineticDragFlywheel = (t: DOMHighResTimeStamp) => {
    const needsRerender = kineticFlywheel(
      interactionState.horizontalZoomPan,
      interactionState.horizontalScreenDimensions.innerSize,
    );
    if (needsRerender) {
      timedRender(t); // it's important that it be synchronous (rather than scheduleChartRender()) otherwise zoom-pan combos freeze a bit
      window.requestAnimationFrame(kineticDragFlywheel);
    }
  };

  const dragEnd = () => {
    endDrag(interactionState.horizontalZoomPan);
    window.requestAnimationFrame(kineticDragFlywheel);
  };

  const touchmove = (e: TouchEvent) => {
    const shouldUpdate = touchUpdate(interactionState, touches(e));
    if (shouldUpdate) scheduleChartRender();
  };

  const mousemove = (e: MouseEvent) => {
    if (e.buttons !== 1) return;
    interactionState.multitouch = initialMultitouch();
    const zoomPan = interactionState.horizontalZoomPan;
    resetTouchZoom(zoomPan);
    if (
      (inCartesianBand(interactionState.horizontalScreenDimensions, zoomSafePointerX(e)) &&
        inCartesianBand(interactionState.verticalScreenDimensions, zoomSafePointerY(e))) ||
      touchOngoing(zoomPan)
    ) {
      if (panOngoing(zoomPan)) {
        doPanFromPosition(zoomPan, interactionState.horizontalScreenDimensions.innerSize, zoomSafePointerX(e));
        scheduleChartRender();
      } else {
        dragStart(e);
      }
    }
  };

  const mousedown = (e: MouseEvent) =>
    inCartesianBand(interactionState.horizontalScreenDimensions, zoomSafePointerX(e)) &&
    inCartesianBand(interactionState.verticalScreenDimensions, zoomSafePointerY(e)) &&
    dragStart(e);

  const keydown = (e: KeyboardEvent) => {
    const panDirection = { ArrowLeft: -1, ArrowRight: 1 }[e.code] ?? 0;
    const zoomDirection = { ArrowUp: -1, ArrowDown: 1 }[e.code] ?? 0;

    // todo move to zoompan ts
    if (panDirection || zoomDirection) {
      if (panDirection) {
        const normalizedDeltaPan = panDirection / keyPanVelocityDivisor;
        doPanFromJumpDelta(interactionState.horizontalZoomPan, normalizedDeltaPan);
      }
      if (zoomDirection) {
        const normalizedDeltaZoom = zoomDirection / keyZoomVelocityDivisor;
        const center = 0.5;
        doZoomFromJumpDelta(interactionState.horizontalZoomPan, normalizedDeltaZoom, center);
      }
      e.preventDefault(); // preventDefault needed because otherwise a right arrow key takes the user to the next element
      scheduleChartRender();
    }
  };

  window.addEventListener('resize', scheduleChartRender, { passive: false });
  canvas.addEventListener('wheel', wheel, { passive: false });
  canvas.addEventListener('mousemove', mousemove, { passive: false });
  canvas.addEventListener('mousedown', mousedown, { passive: false });
  canvas.addEventListener('mouseup', dragEnd, { passive: false });
  canvas.addEventListener('touchmove', touchmove, { passive: false });
  canvas.addEventListener('touchend', dragEnd, { passive: false });
  canvas.addEventListener('touchcancel', dragEnd, { passive: false });
  canvas.addEventListener('keydown', keydown, { passive: false });

  return () => {
    window.removeEventListener('resize', scheduleChartRender);
    canvas.removeEventListener('wheel', wheel);
    canvas.removeEventListener('mousemove', mousemove);
    canvas.removeEventListener('mousedown', mousedown);
    canvas.removeEventListener('mouseup', dragEnd);
    canvas.removeEventListener('touchmove', touchmove);
    canvas.removeEventListener('touchend', dragEnd);
    canvas.removeEventListener('touchcancel', dragEnd);
    canvas.removeEventListener('keydown', keydown);
  };
};

/**
 * The running chart, for the component that owns the surface.
 * @internal
 */
export interface TimeslipLoop {
  /** schedules a frame, e.g. after the surface was resized, which clears a canvas */
  render: () => void;
  /** stops the loop: listeners off, pending frame cancelled, so the component can restart it or unmount */
  stop: () => void;
  /** draws the frame the chart currently shows into another context, e.g. for an export */
  paint: (ctx: Ctx2d) => void;
}

/** @internal */
export const timeslipRender = (surface: FrameSurface, getData: GetData): TimeslipLoop => {
  const emWidth = surface.measureText('mmmmmmmmmm') / 10; // approx width to avoid too many measurements

  const interactionState = getNullInteractionState();
  const dataState = getNullDataState();
  let stopped = false;

  const chartWithUpdate = (t: DOMHighResTimeStamp) => {
    if (stopped) return;
    const { dataArrived, yTweenOngoing, dataDemand } = chartWithTime(
      surface,
      config,
      interactionState,
      dataState,
      t,
      emWidth,
    );
    if (dataArrived) updateDataState(dataState, dataDemand, getEnrichedData(getData(dataDemand)));
    if (dataArrived || yTweenOngoing) scheduleChartRender();
  };

  const timedRender = withDeltaTime(chartWithUpdate);
  const scheduleChartRender = withAnimation(timedRender);

  // initial render
  scheduleChartRender();

  const removeEventHandlers = setupEventHandlers(surface.element, interactionState, timedRender, scheduleChartRender);

  return {
    render: scheduleChartRender,
    paint: (ctx) => {
      drawFrame(ctx, layoutOf(surface.element), config, interactionState, dataState, 0, emWidth);
    },
    stop: () => {
      stopped = true;
      scheduleChartRender.cancel();
      removeEventHandlers();
    },
  };
};
