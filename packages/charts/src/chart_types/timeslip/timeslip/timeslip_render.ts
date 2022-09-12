/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTimeZone, validatedTimeZone } from '../../../utils/time_zone';
import { cachedZonedDateTimeFrom, timeProp } from '../../xy_chart/axes/timeslip/chrono/cached_chrono';
import { DEFAULT_LOCALE, MINIMUM_TICK_PIXEL_DISTANCE } from '../../xy_chart/axes/timeslip/multilayer_ticks';
import { BinUnit, RasterConfig, rasters, TimeBin } from '../../xy_chart/axes/timeslip/rasters';
import { GetData } from '../timeslip_api';
import { axisModel } from './axis_model';
import { getEnrichedData } from './data';
import { domainTween } from './domain_tween';
import { renderChartTitle } from './render/annotations/chart_title';
import { LocaleOptions, renderTimeExtentAnnotation } from './render/annotations/time_extent';
import { renderTimeUnitAnnotation } from './render/annotations/time_unit';
import { DataDemand, renderCartesian } from './render/cartesian';
import { BoxplotRow } from './render/glyphs/boxplot';
import { renderDebugBox } from './render/glyphs/debug_box';
import { ElementSize, elementSizes, zoomSafePointerX, zoomSafePointerY } from './utils/dom';
import { clamp, mix, unitClamp } from './utils/math';
import { axisScale, getDesiredTickCount } from './utils/scale';

const panOngoing = (interactionState: { dragStartX: number }) => Number.isFinite(interactionState.dragStartX);

const initialDarkMode = false;
const drawCartesianBox = false;

const minZoom = 0;
const maxZoom = 35;

// these are hand tweaked constants that fulfill various design constraints, let's discuss before changing them
const lineThicknessSteps = [/*0,*/ 0.5, 0.75, 1, 1, 1, 1.25, 1.25, 1.5, 1.5, 1.75, 1.75, 2, 2, 2, 2, 2];
const lumaSteps = [/*255,*/ 192, 72, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];

const smallFontSize = 12;
const timeZone = validatedTimeZone(getTimeZone([])); // should eventually come from settings

type RGBObject = { r: number; g: number; b: number };

interface MappedTouch {
  id: number;
  x: number;
}

interface TimeslipTheme {
  defaultFontColor: string;
  subduedFontColor: string;
  offHourFontColor: string;
  weekendFontColor: string;
  backgroundColor: RGBObject;
  lumaSteps: number[];
}

const themeLight: TimeslipTheme = {
  defaultFontColor: 'black',
  subduedFontColor: '#393939',
  offHourFontColor: 'black',
  weekendFontColor: 'darkred',
  backgroundColor: { r: 255, g: 255, b: 255 },
  lumaSteps,
};

const themeDark: TimeslipTheme = {
  defaultFontColor: 'white',
  subduedFontColor: 'darkgrey',
  offHourFontColor: 'white',
  weekendFontColor: 'indianred',
  backgroundColor: { r: 0, g: 0, b: 0 },
  lumaSteps: lumaSteps.map((l) => 255 - l),
};

type CompactDisplay = 'short' | 'long'; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

/** @internal */
export interface TimeslipConfig extends TimeslipTheme, RasterConfig {
  darkMode: boolean;
  sparse: false;
  implicit: false;
  maxLabelRowCount: number; // can be 1, 2, 3
  a11y: { contrast: 'low' | 'medium' | 'high' };
  numUnit: CompactDisplay | 'none';
  barChroma: RGBObject;
  barFillAlpha: number;
  lineThicknessSteps: number[];
  domainFrom: number;
  domainTo: number;
  smallFontSize: number;
  cssFontShorthand: string;
  monospacedFontShorthand: string;
  rowPixelPitch: number;
  horizontalPixelOffset: number;
  verticalPixelOffset: number;
  clipLeft: boolean;
  clipRight: boolean;
  yTickOverhang: number;
  yTickGap: number;
}

const rasterConfig: RasterConfig = {
  minimumTickPixelDistance: MINIMUM_TICK_PIXEL_DISTANCE,
  locale: DEFAULT_LOCALE,
};

const config: TimeslipConfig = {
  darkMode: initialDarkMode,
  ...(initialDarkMode ? themeDark : themeLight),
  ...rasterConfig,
  sparse: false,
  implicit: false,
  maxLabelRowCount: 2, // can be 1, 2, 3
  a11y: {
    contrast: 'medium',
  },
  numUnit: 'short',
  barChroma: { r: 96, g: 146, b: 192 },
  barFillAlpha: 0.3,
  lineThicknessSteps,
  domainFrom: cachedZonedDateTimeFrom({ timeZone, year: 2012, month: 1, day: 1 })[timeProp.epochSeconds],
  domainTo: cachedZonedDateTimeFrom({ timeZone, year: 2022, month: 1, day: 1 })[timeProp.epochSeconds],
  smallFontSize,
  cssFontShorthand: `normal normal 100 ${smallFontSize}px Inter, Helvetica, Arial, sans-serif`,
  monospacedFontShorthand: `normal normal 100 ${smallFontSize}px "Roboto Mono", Consolas, Menlo, Courier, monospace`,
  rowPixelPitch: 16,
  horizontalPixelOffset: 4,
  verticalPixelOffset: 6,
  clipLeft: true,
  clipRight: true,
  yTickOverhang: 8,
  yTickGap: 8,
};

const rasterSelector = rasters(rasterConfig, timeZone);

// constants for Y
const ZERO_Y_BASE = true;

const horizontalCartesianAreaPad: [number, number] = [0.04, 0.04];
const verticalCartesianAreaPad: [number, number] = [0.12, 0.12];

const initialZoom = 5.248;
const initialPan = 0.961;

const localeOptions: LocaleOptions = {
  hour12: false,
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

// todo this may need an update with locale change
const defaultLabelFormat = new Intl.DateTimeFormat(config.locale, {
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  timeZone,
}).format.bind(Intl.DateTimeFormat);

// todo this may need an update with locale change
const defaultMinorTickLabelFormat = new Intl.DateTimeFormat(config.locale, {
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  timeZone,
}).format.bind(Intl.DateTimeFormat);

const fadeOutPixelWidth = 12; // todo add to config

const chartTopFontSize = config.smallFontSize + 2; // todo move to config
const background = config.backgroundColor;
const backgroundFillStyle = `rgba(${background.r},${background.g},${background.b},1)`;

// these two change together: the kinetic friction deceleration from a click drag, and from a wheel drag should match
// currently, the narrower the chart, the higher the deceleration, which is perhaps better than width invariant slowing
const dragVelocityAttenuation = 0.92;
const wheelPanVelocityDivisor = 1000;

const wheelZoomVelocityDivisor = 250;
const keyZoomVelocityDivisor = 2; // 1 means, on each up/down keypress, double/halve the visible time domain
const keyPanVelocityDivisor = 10; // 1 means, on each left/right keypress, move the whole of current visible time domain

const velocityThreshold = 0.01;

interface InteractionState {
  // current zoom and pan level
  zoom: number;
  pan: number;

  // remembering touch points for zoom/pam
  multitouch: MappedTouch[];

  // zoom/pan
  dragStartX: number;
  zoomStart: number;
  panStart: number;

  // kinetic pan
  lastDragX: number;
  dragVelocity: number;
  flyVelocity: number;

  // Y domain
  niceDomainMin: number;
  niceDomainMax: number;

  // other
  screenDimensions: ElementSize;
}

const touchMidpoint = (multitouch: MappedTouch[]) => (multitouch[0].x + multitouch[1].x) / 2;

const isNonNull = <T>(thing: T | null): thing is T => thing !== null;

/** @internal */
export type NumericScale = (n: number) => number;

/** @public */
export type TimeslipDataRows = Array<{ epochMs: number; boxplot?: BoxplotRow['boxplot']; value?: number }>;

type DataResponse = { stats: { minValue: number; maxValue: number }; rows: TimeslipDataRows };

/** @internal */
export interface DataState {
  valid: boolean;
  pending: boolean;
  lo: (TimeBin & Partial<Record<BinUnit, number>>) | null;
  hi: (TimeBin & Partial<Record<BinUnit, number>>) | null;
  binUnit: BinUnit;
  binUnitCount: number;
  dataResponse: DataResponse;
}

const invalid = (dataState: DataState, dataDemand: DataDemand) =>
  !dataState.valid ||
  dataState.binUnit !== dataDemand.binUnit ||
  dataState.binUnitCount !== dataDemand.binUnitCount ||
  (dataDemand.lo?.timePointSec ?? -Infinity) < (dataState.lo?.timePointSec ?? -Infinity) ||
  (dataDemand.hi?.timePointSec ?? Infinity) > (dataState.hi?.timePointSec ?? Infinity);

const updateDataState = (dataState: DataState, dataDemand: Parameters<GetData>[0], dataResponse: DataResponse) => {
  dataState.pending = false;
  dataState.valid = true;
  dataState.lo = dataDemand.lo;
  dataState.hi = dataDemand.hi;
  dataState.binUnit = dataDemand.binUnit;
  dataState.binUnitCount = dataDemand.binUnitCount;
  dataState.dataResponse = dataResponse;
};

const yTickNumberFormatter = new Intl.NumberFormat(
  config.locale,
  config.numUnit === 'none'
    ? {}
    : {
        notation: 'compact',
        compactDisplay: config.numUnit,
      },
).format.bind(Intl.NumberFormat);

const zoomMultiplier = (zoom: number) => 2 ** zoom;

const inCartesianArea = (screenDimensions: ElementSize, e: MouseEvent) => {
  const x = zoomSafePointerX(e);
  const y = zoomSafePointerY(e);
  const { innerTop, innerBottom, innerLeft, innerRight } = screenDimensions;
  return innerLeft <= x && x <= innerRight && innerTop <= y && y <= innerBottom;
};

const getTimeDomain = (interactionState: InteractionState, fromSec: number, toSec: number) => {
  const fullTimeExtent = toSec - fromSec;
  const { pan } = interactionState;
  const zoomedTimeExtent = fullTimeExtent / zoomMultiplier(interactionState.zoom);
  const leeway = fullTimeExtent - zoomedTimeExtent;
  const domainFrom = fromSec + pan * leeway;
  const domainTo = toSec - (1 - pan) * leeway;
  return { domainFrom, domainTo };
};

const getPanDeltaPerDragPixel = (interactionState: InteractionState) =>
  1 / ((zoomMultiplier(interactionState.zoom) - 1) * interactionState.screenDimensions.innerWidth);

const panFromDeltaPixel = (interactionState: InteractionState, panStart: number, delta: number) => {
  const panDeltaPerDragPixel = getPanDeltaPerDragPixel(interactionState);
  interactionState.pan = Math.max(0, Math.min(1, panStart - panDeltaPerDragPixel * delta)) || 0;
};

const inCartesianBand = (screenDimensions: ElementSize, y: number) => {
  const { innerTop: cartesianTop, innerBottom: cartesianBottom } = screenDimensions;
  return cartesianTop <= y && y <= cartesianBottom;
};

const zoom = (interactionState: InteractionState, pointerUnitLocation: number, newZoom: number, panDelta = 0) => {
  const oldInvisibleFraction = 1 - 1 / zoomMultiplier(interactionState.zoom);
  interactionState.zoom = clamp(newZoom, minZoom, maxZoom);
  const newInvisibleFraction = 1 - 1 / zoomMultiplier(interactionState.zoom);
  interactionState.pan =
    unitClamp(mix(pointerUnitLocation + panDelta, interactionState.pan, oldInvisibleFraction / newInvisibleFraction)) ||
    0;
};
const zoomAroundX = (interactionState: InteractionState, centerX: number, newZoom: number, panDelta = 0) => {
  const { innerWidth: cartesianWidth, innerLeft: cartesianLeft } = interactionState.screenDimensions;
  const unitZoomCenter = Math.max(0, Math.min(cartesianWidth, centerX - cartesianLeft)) / cartesianWidth;
  zoom(interactionState, unitZoomCenter, newZoom, panDelta);
};

const pan = (interactionState: InteractionState, normalizedDeltaPan: number) => {
  const deltaPan = normalizedDeltaPan / 2 ** interactionState.zoom;
  interactionState.pan = unitClamp(interactionState.pan + deltaPan) || 0;
};

const panZoomJump = (interactionState: InteractionState, panDirection: number, zoomDirection: number) => {
  const panOrZoom = panDirection || zoomDirection;
  if (panOrZoom) {
    if (panDirection) pan(interactionState, panDirection / keyPanVelocityDivisor);
    if (zoomDirection) zoom(interactionState, 0.5, interactionState.zoom + zoomDirection / keyZoomVelocityDivisor);
  }
  return panOrZoom;
};

const dragStartAtX = (interactionState: InteractionState, startingX: number) => {
  interactionState.dragStartX = startingX;
  interactionState.lastDragX = startingX;
  interactionState.dragVelocity = NaN;
  interactionState.flyVelocity = NaN;
  interactionState.panStart = interactionState.pan;
};

const zoomOrPan = (interactionState: InteractionState, panning: boolean, centerX: number, deltaY: number) => {
  if (panning) {
    pan(interactionState, -deltaY / wheelPanVelocityDivisor);
  } else {
    const newZoom = interactionState.zoom - deltaY / wheelZoomVelocityDivisor;
    zoomAroundX(interactionState, centerX, newZoom);
  }
};

const endDrag = (interactionState: InteractionState) => {
  interactionState.flyVelocity = interactionState.dragVelocity;
  interactionState.dragVelocity = NaN;
  interactionState.dragStartX = NaN;
  interactionState.panStart = NaN;
};

const panFromX = (interactionState: InteractionState, currentX: number) => {
  const deltaX = currentX - interactionState.lastDragX;
  const { dragVelocity } = interactionState;
  interactionState.dragVelocity =
    deltaX * dragVelocity > 0 && Math.abs(deltaX) < Math.abs(dragVelocity)
      ? dragVelocity // mix(dragVelocity, deltaX, 0.04)
      : deltaX;
  interactionState.lastDragX = currentX;
  const delta = currentX - interactionState.dragStartX;
  panFromDeltaPixel(interactionState, interactionState.panStart, delta);
  return delta;
};

const touches = (e: TouchEvent) =>
  [...new Array(e.touches?.length ?? 0)]
    .map((n: number) => e.touches.item(n))
    .filter(isNonNull)
    .map((t: Touch) => ({ id: t.identifier, x: t.clientX }))
    .sort(({ x: a }, { x: b }) => a - b);

const touchUpdate = (interactionState: InteractionState, multitouch: MappedTouch[]) => {
  if (interactionState.multitouch.length === 0 && multitouch.length === 2) {
    interactionState.multitouch = multitouch;
    interactionState.zoomStart = interactionState.zoom;
    const centerX = touchMidpoint(multitouch);
    dragStartAtX(interactionState, centerX);
  } else if (
    multitouch.length !== 2 ||
    [...multitouch, ...interactionState.multitouch].filter((t, i, a) => a.findIndex((tt) => tt.id === t.id) === i)
      .length !== 2
  ) {
    interactionState.multitouch = [];
    interactionState.zoomStart = NaN;
  }
  const isPinchZoom = interactionState.multitouch.length === 2;
  if (isPinchZoom) {
    const centerX = touchMidpoint(multitouch);
    const zoomMultiplierValue =
      (multitouch[1].x - multitouch[0].x) / (interactionState.multitouch[1].x - interactionState.multitouch[0].x);
    const panDelta = 0; // panFromX(centerX)
    zoomAroundX(interactionState, centerX, interactionState.zoomStart + Math.log2(zoomMultiplierValue), panDelta);
  }
  return isPinchZoom;
};

const kineticFlywheel = (interactionState: InteractionState) => {
  const velocity = interactionState.flyVelocity;
  const needsViewUpdate = Math.abs(velocity) > velocityThreshold;
  if (needsViewUpdate) {
    panFromDeltaPixel(interactionState, interactionState.pan, velocity);
    interactionState.flyVelocity *= dragVelocityAttenuation;
  } else {
    interactionState.flyVelocity = NaN;
  }
  return needsViewUpdate;
};

const touchstart = (/* e: TouchEvent */) => {
  // inCartesianArea(e) && dragStart(e)
};

const ensureCanvasResolution = (
  canvas: HTMLCanvasElement,
  { outerWidth, outerHeight }: ElementSize,
  newCanvasWidth: number,
  newCanvasHeight: number,
) => {
  if (newCanvasWidth !== outerWidth) {
    canvas.setAttribute('width', String(newCanvasWidth));
  }
  if (newCanvasHeight !== outerHeight) {
    canvas.setAttribute('height', String(newCanvasHeight));
  }
};

const withAnimation = (renderer: FrameRequestCallback) => {
  let rAF = -1;
  return () => {
    window.cancelAnimationFrame(rAF);
    rAF = window.requestAnimationFrame(renderer);
  };
};

const withDeltaTime = (renderer: FrameRequestCallback) => {
  let prevT = 0;
  return (t: DOMHighResTimeStamp) => {
    const deltaT = t - prevT;
    prevT = t;
    renderer(deltaT);
  };
};

const doCartesian = (
  ctx: CanvasRenderingContext2D,
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
  const yUnitScale = axisScale(interactionState.niceDomainMin, interactionState.niceDomainMax);
  const yUnitScaleClamped: NumericScale = (d) => unitClamp(yUnitScale(d));

  const dataDemand = renderCartesian(
    ctx,
    config,
    dataState,
    defaultMinorTickLabelFormat,
    emWidth,
    fadeOutPixelWidth,
    defaultLabelFormat,
    yTickNumberFormatter,
    rasterSelector,
    cartesianWidth,
    cartesianHeight,
    timeDomain,
    yUnitScale,
    yUnitScaleClamped,
    niceTicks,
  );

  ctx.restore();

  return { yTweenOngoing, dataDemand };
};

const renderChartWithTime = (
  ctx: CanvasRenderingContext2D,
  backgroundFillStyle: string,
  newCanvasWidth: number,
  newCanvasHeight: number,
  config: TimeslipConfig,
  chartWidth: number,
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
  dpi: number,
  fromSec: number,
  toSec: number,
) => {
  ctx.save();
  ctx.scale(dpi, dpi);
  ctx.fillStyle = backgroundFillStyle;
  // clearRect is not enough, as browser image copy ignores canvas background color
  ctx.fillRect(0, 0, newCanvasWidth, newCanvasHeight);

  // chart title
  renderChartTitle(ctx, config.subduedFontColor, chartWidth, cartesianTop);

  ctx.translate(cartesianLeft, cartesianTop);

  const timeDomain = getTimeDomain(interactionState, fromSec, toSec);

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

  // chart time unit info
  renderTimeUnitAnnotation(
    ctx,
    config,
    dataDemand.binUnitCount,
    dataDemand.binUnit,
    chartTopFontSize,
    dataDemand.unitBarMaxWidthPixels,
  );

  // chart time from/to extent info
  renderTimeExtentAnnotation(ctx, config, localeOptions, timeDomain, cartesianWidth, chartTopFontSize);

  ctx.restore();
  return { yTweenOngoing, dataDemand };
};

const chartWithTime = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  config: TimeslipConfig,
  interactionState: InteractionState,
  dataState: DataState,
  deltaT: number,
  dpi: number,
  emWidth: number,
) => {
  const newScreenDimensions = elementSizes(canvas, horizontalCartesianAreaPad, verticalCartesianAreaPad);
  const {
    outerWidth: chartWidth,
    outerHeight: chartHeight,
    innerLeft: cartesianLeft,
    innerWidth: cartesianWidth,
    innerTop: cartesianTop,
    innerHeight: cartesianHeight,
  } = newScreenDimensions;

  // resize if needed
  const newCanvasWidth = dpi * chartWidth;
  const newCanvasHeight = dpi * chartHeight;
  ensureCanvasResolution(canvas, interactionState.screenDimensions, newCanvasWidth, newCanvasHeight);
  interactionState.screenDimensions = newScreenDimensions;

  // render chart
  const { yTweenOngoing, dataDemand } = renderChartWithTime(
    ctx,
    backgroundFillStyle,
    newCanvasWidth,
    newCanvasHeight,
    config,
    chartWidth,
    cartesianTop,
    cartesianLeft,
    cartesianHeight,
    interactionState,
    deltaT,
    cartesianWidth,
    drawCartesianBox,
    chartTopFontSize,
    dataState,
    emWidth,
    dpi,
    config.domainFrom,
    config.domainTo,
  );

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

const getNullInteractionState = (canvas: HTMLCanvasElement): InteractionState => ({
  // current zoom and pan level
  zoom: initialZoom,
  pan: initialPan,

  // remembering touch points for zoom/pam
  multitouch: [],

  // zoom/pan
  dragStartX: NaN,
  zoomStart: NaN,
  panStart: NaN,

  // kinetic pan
  lastDragX: NaN,
  dragVelocity: NaN,
  flyVelocity: NaN,

  // Y domain
  niceDomainMin: NaN,
  niceDomainMax: NaN,

  // other
  screenDimensions: elementSizes(canvas, horizontalCartesianAreaPad, verticalCartesianAreaPad),
});

const getNullDataState = (): DataState => ({
  valid: false,
  pending: false,
  lo: { timePointSec: Infinity, nextTimePointSec: Infinity },
  hi: { timePointSec: -Infinity, nextTimePointSec: -Infinity },
  binUnit: 'year',
  binUnitCount: NaN,
  dataResponse: { stats: { minValue: NaN, maxValue: NaN }, rows: [] },
});

const setupEventHandlers = (
  canvas: HTMLCanvasElement,
  interactionState: InteractionState,
  timedRender: FrameRequestCallback,
  scheduleChartRender: () => void,
) => {
  const wheel = (e: WheelEvent) => {
    if (!inCartesianBand(interactionState.screenDimensions, zoomSafePointerY(e))) return;
    zoomOrPan(interactionState, e.metaKey, zoomSafePointerX(e), e.deltaY);
    scheduleChartRender();
  };

  const dragStart = (e: MouseEvent) => dragStartAtX(interactionState, zoomSafePointerX(e));

  const kineticDragFlywheel = (t: DOMHighResTimeStamp) => {
    const needsRerender = kineticFlywheel(interactionState);
    if (needsRerender) {
      timedRender(t); // it's important that it be synchronous (rather than scheduleChartRender()) otherwise zoom-pan combos freeze a bit
      window.requestAnimationFrame(kineticDragFlywheel);
    }
  };

  const dragEnd = () => {
    endDrag(interactionState);
    window.requestAnimationFrame(kineticDragFlywheel);
  };

  const touchmove = (e: TouchEvent) => {
    const shouldUpdate = touchUpdate(interactionState, touches(e));
    if (shouldUpdate) scheduleChartRender();
  };

  const mousemove = (e: MouseEvent) => {
    if (e.buttons !== 1) return;
    interactionState.multitouch = [];
    interactionState.zoomStart = NaN;
    if (inCartesianArea(interactionState.screenDimensions, e) || Number.isFinite(interactionState.panStart)) {
      if (panOngoing(interactionState)) {
        panFromX(interactionState, zoomSafePointerX(e));
        scheduleChartRender();
      } else {
        dragStart(e);
      }
    }
  };

  const mousedown = (e: MouseEvent) => inCartesianArea(interactionState.screenDimensions, e) && dragStart(e);

  const keydown = (e: KeyboardEvent) => {
    const panDirection = { ArrowLeft: -1, ArrowRight: 1 }[e.code] ?? 0;
    const zoomDirection = { ArrowUp: -1, ArrowDown: 1 }[e.code] ?? 0;
    if (panZoomJump(interactionState, panDirection, zoomDirection)) {
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
  canvas.addEventListener('touchstart', touchstart, { passive: false });
  canvas.addEventListener('touchend', dragEnd, { passive: false });
  canvas.addEventListener('touchcancel', dragEnd, { passive: false });
  canvas.addEventListener('keydown', keydown, { passive: false });
};

/** @internal */
export const timeslipRender = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, getData: GetData) => {
  const dpi = window.devicePixelRatio;
  const emWidth = ctx.measureText('mmmmmmmmmm').width / 10; // approx width to avoid too many measurements

  const interactionState = getNullInteractionState(canvas);
  const dataState = getNullDataState();

  const chartWithUpdate = (t: DOMHighResTimeStamp) => {
    const { dataArrived, yTweenOngoing, dataDemand } = chartWithTime(
      canvas,
      ctx,
      config,
      interactionState,
      dataState,
      t,
      dpi,
      emWidth,
    );
    if (dataArrived) updateDataState(dataState, dataDemand, getEnrichedData(getData(dataDemand)));
    if (dataArrived || yTweenOngoing) scheduleChartRender();
  };

  const timedRender = withDeltaTime(chartWithUpdate);
  const scheduleChartRender = withAnimation(timedRender);

  // initial render
  scheduleChartRender();

  setupEventHandlers(canvas, interactionState, timedRender, scheduleChartRender);
};
