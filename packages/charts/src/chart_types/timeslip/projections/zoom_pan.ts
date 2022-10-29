/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { clamp, mix, unitClamp } from '../utils/math';

const VELOCITY_THRESHOLD = 0.01;
const DRAG_VELOCITY_ATTENUATION = 0.92; // these two change together: the kinetic friction deceleration from a click drag, and from a wheel drag should match
const INITIAL_ZOOM = 5.248;
const INITIAL_PAN = 0.961; // doesn't matter if INITIAL_ZOOM is 0, this is just a ratio

interface Focus {
  zoom: number; // Exponential: 0: full domain is in view; 1: half, 2: quarter, ie. the visible view is a 1 / 2^zoom multiple of the full domain
  pan: number; // 0: left side of focus is flush with the left side of the full domain, given zoom level, 1: right side of focus is flush with the right side of the full domain
}

/** @internal */
export interface ZoomPan {
  focus: Focus;
  flyVelocity: number;

  // interaction auxiliary state
  focusStart: Focus;
  dragStartPosition: number;

  // kinetic pan gesture state
  lastDragPosition: number;
  dragVelocity: number;
}

/** @internal */
export const initialZoomPan = () => ({
  focus: { zoom: INITIAL_ZOOM, pan: INITIAL_PAN },
  flyVelocity: NaN,
  focusStart: { zoom: NaN, pan: NaN },
  dragStartPosition: NaN,
  lastDragPosition: NaN,
  dragVelocity: NaN,
});

/**
 * What's essential about zooming and panning?
 *
 * Conceptual cornerstone elements:
 *   - Reference domain: a connected subset of a totally ordered set, which represents the entire domain relative to which we can zoom and pan.
 *       Examples: a time interval, real interval, integer interval, or a finite ordinal set eg. Jan-Dec categories, Likert scale etc.
 *       Note that while the Domain represents the reference interval, it's possible to zoom outside the domain, unless constrained
 *   - Focus: it is also a connected subset of a totally ordered set
 *
 * Derivable elements:
 *   - Zoom: a number such that (referenceDomainTo - referenceDomainFrom) * 1 / 2^zoom represents the currently focused domain
 *   - Pan: 0: left side of focus is flush with the left side of the reference domain, given zoom level, 1: right side of focus is flush with the right side of the reference domain
 *
 *    Note that while these are derivable, it's also legit to directly control zoom and pan, and derive the focus domain from that and the reference domain, like map zoom/pan
 *
 * Desirable properties:
 *   - resolution invariance: should not know anything about pixel sizes of the focus, or pixel length of the drag interaction
 *   - underlying domain invariance: should work with time, reals, integers, ordinals (incl. ordered categories)
 *   - reference domain from/to invariance? possible with zoom&pan but maybe it's not the final say
 *   - nicely integrate with the scale function
 */

const ZOOM_MIN = 0; // 0 means, entire reference view
const ZOOM_MAX = 35; // 35 means, reference domain divided by 2^35
const PAN_MIN = 0; // 0 means, cannot breach the left side of the reference domain
const PAN_MAX = 1; // 1 means, cannot breach the right side of the reference domain

const zoomToMultiplier = (zoom: number) => 1 / 2 ** zoom;

/** @internal */
export const multiplierToZoom = (multiplier: number): number => Math.log2(1 / multiplier);

const getFocusDomainRatio = (zoom: number) => 1 / (1 - zoomToMultiplier(zoom)) - 1;
const clampZoom = (zoom: number) => clamp(zoom, ZOOM_MIN, ZOOM_MAX) || 0;
const clampPan = (pan: number) => clamp(pan, PAN_MIN, PAN_MAX) || 0;

const setPan = (focus: Focus, pan: number) => (focus.pan = pan);

const setZoomPan = (focus: Focus, newZoomPan: Focus) => Object.assign(focus, newZoomPan);

const getFocusForNewZoom = (focus: Focus, pointerUnitLocation: number, newZoom: number, panDelta: number) => {
  const oldInvisibleFraction = 1 - zoomToMultiplier(focus.zoom);
  const zoom = clampZoom(newZoom);
  const newInvisibleFraction = 1 - zoomToMultiplier(zoom);
  const requestedPan = mix(pointerUnitLocation + panDelta, focus.pan, oldInvisibleFraction / newInvisibleFraction);
  const pan = clampPan(requestedPan);
  return { zoom, pan };
};

const getPanFromDelta = (focus: Focus, panStart: number, relativeDelta: number) => {
  const panDeltaPerDrag = getFocusDomainRatio(focus.zoom);
  const panDifference = panDeltaPerDrag * relativeDelta;
  return clampPan(panStart - panDifference);
};

/** @internal */
export const doPanFromJumpDelta = (zoomPan: ZoomPan, normalizedDeltaPan: number) => {
  const deltaPan = zoomToMultiplier(zoomPan.focus.zoom) * normalizedDeltaPan;
  const newPan = clampPan(zoomPan.focus.pan + deltaPan);

  setPan(zoomPan.focus, newPan);
};

/** @internal */
export const doZoomFromJumpDelta = (zoomPan: ZoomPan, normalizedDeltaZoom: number, center: number) => {
  const newZoom = zoomPan.focus.zoom + normalizedDeltaZoom;
  const newZoomPan = getFocusForNewZoom(zoomPan.focus, center, newZoom, 0);

  setZoomPan(zoomPan.focus, newZoomPan);
};

/** @internal */
export const doZoomAroundPosition = (
  zoomPan: ZoomPan,
  { innerSize: cartesianWidth, innerLeading: cartesianLeft }: { innerSize: number; innerLeading: number },
  center: number,
  zoomChange: number,
  panDelta: number,
  touch: boolean,
) => {
  const unitZoomCenter = unitClamp((center - cartesianLeft) / cartesianWidth);
  const base = touch ? zoomPan.focusStart.zoom : zoomPan.focus.zoom;
  const newZoomPan = getFocusForNewZoom(zoomPan.focus, unitZoomCenter, base + zoomChange, panDelta);

  setZoomPan(zoomPan.focus, newZoomPan);
};

/** @internal */
export const kineticFlywheel = (zoomPan: ZoomPan, size: number) => {
  const velocity = zoomPan.flyVelocity;
  const needsViewUpdate = Math.abs(velocity) > VELOCITY_THRESHOLD;
  if (needsViewUpdate) {
    const newPan = getPanFromDelta(zoomPan.focus, zoomPan.focus.pan, velocity / size);
    setPan(zoomPan.focus, newPan);
    zoomPan.flyVelocity *= DRAG_VELOCITY_ATTENUATION;
  } else {
    zoomPan.flyVelocity = NaN;
  }
  return needsViewUpdate;
};

/** @internal */
export const getFocusDomain = (zoomPan: ZoomPan, referenceDomainFrom: number, referenceDomainTo: number) => {
  const { zoom, pan } = zoomPan.focus;
  const referenceDomainExtent = referenceDomainTo - referenceDomainFrom;
  const focusDomainExtent = referenceDomainExtent * zoomToMultiplier(zoom);
  const leeway = referenceDomainExtent - focusDomainExtent;
  const domainFrom = referenceDomainFrom + pan * leeway;
  const domainTo = referenceDomainTo - (1 - pan) * leeway;
  return { domainFrom, domainTo };
};

/** @internal */
export const markDragStartPosition = (zoomPan: ZoomPan, position: number) => {
  zoomPan.dragStartPosition = position;
  zoomPan.lastDragPosition = position;
  zoomPan.dragVelocity = NaN;
  zoomPan.flyVelocity = NaN;
  zoomPan.focusStart.pan = zoomPan.focus.pan;
};

/** @internal */
export const endDrag = (zoomPan: ZoomPan) => {
  zoomPan.flyVelocity = zoomPan.dragVelocity;
  zoomPan.dragVelocity = NaN;
  zoomPan.dragStartPosition = NaN;
  zoomPan.focusStart.pan = NaN;
};

/** @internal */
export const doPanFromPosition = (zoomPan: ZoomPan, innerSize: number, currentPosition: number) => {
  const positionDelta = currentPosition - zoomPan.lastDragPosition;
  const { dragVelocity } = zoomPan;
  zoomPan.dragVelocity =
    positionDelta * dragVelocity > 0 && Math.abs(positionDelta) < Math.abs(dragVelocity)
      ? dragVelocity // mix(dragVelocity, positionDelta, 0.04)
      : positionDelta;
  zoomPan.lastDragPosition = currentPosition;
  const delta = currentPosition - zoomPan.dragStartPosition;
  const newPan = getPanFromDelta(zoomPan.focus, zoomPan.focusStart.pan, delta / innerSize);
  setPan(zoomPan.focus, newPan);
};

/** @internal */
export const startTouchZoom = (zoomPan: ZoomPan) => (zoomPan.focusStart.zoom = zoomPan.focus.zoom);

/** @internal */
export const resetTouchZoom = (zoomPan: ZoomPan) => (zoomPan.focusStart.zoom = NaN);

/** @internal */
export const touchOngoing = (zoomPan: ZoomPan) => Number.isFinite(zoomPan.focusStart.pan);

/** @internal */
export const panOngoing = (zoomPan: ZoomPan) => Number.isFinite(zoomPan.dragStartPosition);
