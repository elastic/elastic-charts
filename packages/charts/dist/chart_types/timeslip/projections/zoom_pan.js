"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panOngoing = exports.touchOngoing = exports.resetTouchZoom = exports.startTouchZoom = exports.doPanFromPosition = exports.endDrag = exports.markDragStartPosition = exports.getFocusDomain = exports.kineticFlywheel = exports.doZoomAroundPosition = exports.doZoomFromJumpDelta = exports.doPanFromJumpDelta = exports.multiplierToZoom = exports.initialZoomPan = void 0;
const math_1 = require("../utils/math");
const VELOCITY_THRESHOLD = 0.01;
const DRAG_VELOCITY_ATTENUATION = 0.92;
const INITIAL_ZOOM = 5.248;
const INITIAL_PAN = 0.961;
const initialZoomPan = () => ({
    focus: { zoom: INITIAL_ZOOM, pan: INITIAL_PAN },
    flyVelocity: NaN,
    focusStart: { zoom: NaN, pan: NaN },
    dragStartPosition: NaN,
    lastDragPosition: NaN,
    dragVelocity: NaN,
});
exports.initialZoomPan = initialZoomPan;
const ZOOM_MIN = 0;
const ZOOM_MAX = 35;
const PAN_MIN = 0;
const PAN_MAX = 1;
const zoomToMultiplier = (zoom) => 1 / 2 ** zoom;
const multiplierToZoom = (multiplier) => Math.log2(1 / multiplier);
exports.multiplierToZoom = multiplierToZoom;
const getFocusDomainRatio = (zoom) => 1 / (1 - zoomToMultiplier(zoom)) - 1;
const clampZoom = (zoom) => (0, math_1.clamp)(zoom, ZOOM_MIN, ZOOM_MAX) || 0;
const clampPan = (pan) => (0, math_1.clamp)(pan, PAN_MIN, PAN_MAX) || 0;
const setPan = (focus, pan) => (focus.pan = pan);
const setZoomPan = (focus, newZoomPan) => Object.assign(focus, newZoomPan);
const getFocusForNewZoom = (focus, pointerUnitLocation, newZoom, panDelta) => {
    const oldInvisibleFraction = 1 - zoomToMultiplier(focus.zoom);
    const zoom = clampZoom(newZoom);
    const newInvisibleFraction = 1 - zoomToMultiplier(zoom);
    const requestedPan = (0, math_1.mix)(pointerUnitLocation + panDelta, focus.pan, oldInvisibleFraction / newInvisibleFraction);
    const pan = clampPan(requestedPan);
    return { zoom, pan };
};
const getPanFromDelta = (focus, panStart, relativeDelta) => {
    const panDeltaPerDrag = getFocusDomainRatio(focus.zoom);
    const panDifference = panDeltaPerDrag * relativeDelta;
    return clampPan(panStart - panDifference);
};
const doPanFromJumpDelta = (zoomPan, normalizedDeltaPan) => {
    const deltaPan = zoomToMultiplier(zoomPan.focus.zoom) * normalizedDeltaPan;
    const newPan = clampPan(zoomPan.focus.pan + deltaPan);
    setPan(zoomPan.focus, newPan);
};
exports.doPanFromJumpDelta = doPanFromJumpDelta;
const doZoomFromJumpDelta = (zoomPan, normalizedDeltaZoom, center) => {
    const newZoom = zoomPan.focus.zoom + normalizedDeltaZoom;
    const newZoomPan = getFocusForNewZoom(zoomPan.focus, center, newZoom, 0);
    setZoomPan(zoomPan.focus, newZoomPan);
};
exports.doZoomFromJumpDelta = doZoomFromJumpDelta;
const doZoomAroundPosition = (zoomPan, { innerSize: cartesianWidth, innerLeading: cartesianLeft }, center, zoomChange, panDelta, touch) => {
    const unitZoomCenter = (0, math_1.unitClamp)((center - cartesianLeft) / cartesianWidth);
    const base = touch ? zoomPan.focusStart.zoom : zoomPan.focus.zoom;
    const newZoomPan = getFocusForNewZoom(zoomPan.focus, unitZoomCenter, base + zoomChange, panDelta);
    setZoomPan(zoomPan.focus, newZoomPan);
};
exports.doZoomAroundPosition = doZoomAroundPosition;
const kineticFlywheel = (zoomPan, size) => {
    const velocity = zoomPan.flyVelocity;
    const needsViewUpdate = Math.abs(velocity) > VELOCITY_THRESHOLD;
    if (needsViewUpdate) {
        const newPan = getPanFromDelta(zoomPan.focus, zoomPan.focus.pan, velocity / size);
        setPan(zoomPan.focus, newPan);
        zoomPan.flyVelocity *= DRAG_VELOCITY_ATTENUATION;
    }
    else {
        zoomPan.flyVelocity = NaN;
    }
    return needsViewUpdate;
};
exports.kineticFlywheel = kineticFlywheel;
const getFocusDomain = (zoomPan, referenceDomainFrom, referenceDomainTo) => {
    const { zoom, pan } = zoomPan.focus;
    const referenceDomainExtent = referenceDomainTo - referenceDomainFrom;
    const focusDomainExtent = referenceDomainExtent * zoomToMultiplier(zoom);
    const leeway = referenceDomainExtent - focusDomainExtent;
    const domainFrom = referenceDomainFrom + pan * leeway;
    const domainTo = referenceDomainTo - (1 - pan) * leeway;
    return { domainFrom, domainTo };
};
exports.getFocusDomain = getFocusDomain;
const markDragStartPosition = (zoomPan, position) => {
    zoomPan.dragStartPosition = position;
    zoomPan.lastDragPosition = position;
    zoomPan.dragVelocity = NaN;
    zoomPan.flyVelocity = NaN;
    zoomPan.focusStart.pan = zoomPan.focus.pan;
};
exports.markDragStartPosition = markDragStartPosition;
const endDrag = (zoomPan) => {
    zoomPan.flyVelocity = zoomPan.dragVelocity;
    zoomPan.dragVelocity = NaN;
    zoomPan.dragStartPosition = NaN;
    zoomPan.focusStart.pan = NaN;
};
exports.endDrag = endDrag;
const doPanFromPosition = (zoomPan, innerSize, currentPosition) => {
    const positionDelta = currentPosition - zoomPan.lastDragPosition;
    const { dragVelocity } = zoomPan;
    zoomPan.dragVelocity =
        positionDelta * dragVelocity > 0 && Math.abs(positionDelta) < Math.abs(dragVelocity)
            ? dragVelocity
            : positionDelta;
    zoomPan.lastDragPosition = currentPosition;
    const delta = currentPosition - zoomPan.dragStartPosition;
    const newPan = getPanFromDelta(zoomPan.focus, zoomPan.focusStart.pan, delta / innerSize);
    setPan(zoomPan.focus, newPan);
};
exports.doPanFromPosition = doPanFromPosition;
const startTouchZoom = (zoomPan) => (zoomPan.focusStart.zoom = zoomPan.focus.zoom);
exports.startTouchZoom = startTouchZoom;
const resetTouchZoom = (zoomPan) => (zoomPan.focusStart.zoom = NaN);
exports.resetTouchZoom = resetTouchZoom;
const touchOngoing = (zoomPan) => Number.isFinite(zoomPan.focusStart.pan);
exports.touchOngoing = touchOngoing;
const panOngoing = (zoomPan) => Number.isFinite(zoomPan.dragStartPosition);
exports.panOngoing = panOngoing;
//# sourceMappingURL=zoom_pan.js.map