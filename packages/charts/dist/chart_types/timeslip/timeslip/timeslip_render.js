"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeslipRender = void 0;
const config_1 = require("./config");
const data_1 = require("./data");
const data_fetch_1 = require("./data_fetch");
const chart_title_1 = require("./render/annotations/chart_title");
const time_extent_1 = require("./render/annotations/time_extent");
const time_unit_1 = require("./render/annotations/time_unit");
const cartesian_1 = require("./render/cartesian");
const debug_box_1 = require("./render/glyphs/debug_box");
const continuous_time_rasters_1 = require("../../xy_chart/axes/timeslip/continuous_time_rasters");
const numerical_rasters_1 = require("../../xy_chart/axes/timeslip/numerical_rasters");
const axis_model_1 = require("../projections/axis_model");
const domain_tween_1 = require("../projections/domain_tween");
const scale_1 = require("../projections/scale");
const zoom_pan_1 = require("../projections/zoom_pan");
const animation_1 = require("../utils/animation");
const dom_1 = require("../utils/dom");
const multitouch_1 = require("../utils/multitouch");
const HEADER_ROW_Y_OFFSET = 3;
const getNullDimensions = () => ({
    outerSize: NaN,
    innerLeading: NaN,
    innerTrailing: NaN,
    innerSize: NaN,
});
const getNullInteractionState = () => ({
    horizontalZoomPan: (0, zoom_pan_1.initialZoomPan)(),
    multitouch: (0, multitouch_1.initialMultitouch)(),
    niceDomainMin: NaN,
    niceDomainMax: NaN,
    horizontalScreenDimensions: getNullDimensions(),
    verticalScreenDimensions: getNullDimensions(),
});
const rasterSelector = config_1.HORIZONTAL_AXIS === 'continuousTime' ? (0, continuous_time_rasters_1.continuousTimeRasters)(config_1.rasterConfig, config_1.timeZone) : (0, numerical_rasters_1.numericalRasters)(config_1.rasterConfig);
const yTickNumberFormatter = new Intl.NumberFormat(config_1.config.locale, config_1.config.numUnit === 'none'
    ? {}
    : {
        notation: 'compact',
        compactDisplay: config_1.config.numUnit,
    });
const yTickNumberFormat = (value) => yTickNumberFormatter.format(value);
const touchUpdate = (interactionState, newMultitouch) => {
    const { multitouch, horizontalZoomPan: zoomPan, horizontalScreenDimensions } = interactionState;
    const noPreviousTouch = (0, multitouch_1.zeroTouch)(multitouch);
    const isTwoTouchPinch = (0, multitouch_1.twoTouchPinch)(newMultitouch);
    const center = (0, multitouch_1.touchMidpoint)(newMultitouch);
    const isPinchStart = noPreviousTouch && isTwoTouchPinch;
    if (isPinchStart) {
        (0, multitouch_1.setNewMultitouch)(multitouch, newMultitouch);
        (0, zoom_pan_1.startTouchZoom)(zoomPan);
        (0, zoom_pan_1.markDragStartPosition)(zoomPan, center);
    }
    else if (!isTwoTouchPinch || !(0, multitouch_1.continuedTwoPointTouch)(multitouch, newMultitouch)) {
        (0, multitouch_1.eraseMultitouch)(multitouch);
        (0, zoom_pan_1.resetTouchZoom)(zoomPan);
    }
    const isPinchZoom = (0, multitouch_1.twoTouchPinch)(multitouch);
    const isTouchOngoing = (0, zoom_pan_1.touchOngoing)(zoomPan);
    const isPanOngoing = (0, zoom_pan_1.panOngoing)(zoomPan);
    if (isPinchZoom) {
        const pinchRatio = (0, multitouch_1.getPinchRatio)(multitouch, newMultitouch);
        const desiredZoomChange = (0, zoom_pan_1.multiplierToZoom)(pinchRatio);
        (0, zoom_pan_1.doZoomAroundPosition)(zoomPan, horizontalScreenDimensions, center, desiredZoomChange, 0, true);
    }
    else {
        const inCartesianBand = true;
        if (inCartesianBand || isTouchOngoing) {
            if (isPanOngoing) {
                (0, zoom_pan_1.doPanFromPosition)(zoomPan, horizontalScreenDimensions.innerSize, center);
            }
            else {
                (0, zoom_pan_1.markDragStartPosition)(zoomPan, center);
            }
        }
    }
    return isPinchZoom || (isTouchOngoing && isPanOngoing);
};
const inCartesianBand = (size, value) => size.innerLeading <= value && value <= size.innerTrailing;
const ensureCanvasResolution = (canvas, outerWidth, outerHeight, newCanvasWidth, newCanvasHeight) => {
    if (newCanvasWidth !== outerWidth) {
        canvas.setAttribute('width', String(newCanvasWidth));
    }
    if (newCanvasHeight !== outerHeight) {
        canvas.setAttribute('height', String(newCanvasHeight));
    }
};
const doCartesian = (ctx, cartesianHeight, interactionState, deltaT, cartesianWidth, timeDomain, dataState, emWidth) => {
    ctx.save();
    ctx.translate(0, cartesianHeight);
    const domainLandmarks = [
        dataState.dataResponse.stats.minValue,
        dataState.dataResponse.stats.maxValue,
        ...(config_1.ZERO_Y_BASE ? [0] : []),
    ];
    const desiredTickCount = (0, scale_1.getDesiredTickCount)(cartesianHeight, config_1.config.smallFontSize, config_1.config.sparse);
    const { niceDomainMin, niceDomainMax, niceTicks } = (0, axis_model_1.axisModel)(domainLandmarks, desiredTickCount);
    const yTweenOngoing = (0, domain_tween_1.domainTween)(interactionState, deltaT, niceDomainMin, niceDomainMax);
    const yUnitScale = (0, scale_1.makeLinearScale)(interactionState.niceDomainMin, interactionState.niceDomainMax, 0, 1);
    const dataDemand = (0, cartesian_1.renderCartesian)(ctx, config_1.config, dataState, config_1.defaultMinorTickLabelFormat, emWidth, config_1.fadeOutPixelWidth, config_1.defaultLabelFormat, yTickNumberFormat, rasterSelector, cartesianWidth, cartesianHeight, timeDomain, yUnitScale, niceTicks);
    ctx.restore();
    return { yTweenOngoing, dataDemand };
};
const renderChartWithTime = (ctx, backgroundFillStyle, newCanvasWidth, newCanvasHeight, config, chartWidth, cartesianTop, cartesianLeft, cartesianHeight, interactionState, deltaT, cartesianWidth, drawCartesianBox, chartTopFontSize, dataState, emWidth, dpi, fromSec, toSec) => {
    ctx.save();
    ctx.scale(dpi, dpi);
    ctx.fillStyle = backgroundFillStyle;
    ctx.fillRect(0, 0, newCanvasWidth, newCanvasHeight);
    (0, chart_title_1.renderChartTitle)(ctx, config.subduedFontColor, chartWidth);
    ctx.translate(cartesianLeft, cartesianTop);
    const timeDomain = (0, zoom_pan_1.getFocusDomain)(interactionState.horizontalZoomPan, fromSec, toSec);
    const { yTweenOngoing, dataDemand } = doCartesian(ctx, cartesianHeight, interactionState, deltaT, cartesianWidth, timeDomain, dataState, emWidth);
    if (drawCartesianBox) {
        (0, debug_box_1.renderDebugBox)(ctx, cartesianWidth, cartesianHeight);
    }
    const headerRowOffsetY = -chartTopFontSize * HEADER_ROW_Y_OFFSET;
    (0, time_unit_1.renderTimeUnitAnnotation)(ctx, config, dataDemand.binUnitCount, dataDemand.binUnit, chartTopFontSize, headerRowOffsetY, dataDemand.unitBarMaxWidthPixels);
    (0, time_extent_1.renderTimeExtentAnnotation)(ctx, config, config_1.localeOptions, timeDomain, cartesianWidth, headerRowOffsetY);
    ctx.restore();
    return { yTweenOngoing, dataDemand };
};
const chartWithTime = (canvas, ctx, config, interactionState, dataState, deltaT, dpi, emWidth) => {
    const newHorizontalScreenDimensions = (0, dom_1.elementSize)(canvas, true, config_1.horizontalCartesianAreaPad);
    const chartWidth = newHorizontalScreenDimensions.outerSize;
    const cartesianLeft = newHorizontalScreenDimensions.innerLeading;
    const cartesianWidth = newHorizontalScreenDimensions.innerSize;
    const newVerticalScreenDimensions = (0, dom_1.elementSize)(canvas, false, config_1.verticalCartesianAreaPad);
    const chartHeight = newVerticalScreenDimensions.outerSize;
    const cartesianTop = newVerticalScreenDimensions.innerLeading;
    const cartesianHeight = newVerticalScreenDimensions.innerSize;
    const newCanvasWidth = dpi * chartWidth;
    const newCanvasHeight = dpi * chartHeight;
    ensureCanvasResolution(canvas, interactionState.horizontalScreenDimensions.outerSize, interactionState.verticalScreenDimensions.outerSize, newCanvasWidth, newCanvasHeight);
    interactionState.horizontalScreenDimensions = newHorizontalScreenDimensions;
    interactionState.verticalScreenDimensions = newVerticalScreenDimensions;
    const { yTweenOngoing, dataDemand } = renderChartWithTime(ctx, config_1.backgroundFillStyle, newCanvasWidth, newCanvasHeight, config, chartWidth, cartesianTop, cartesianLeft, cartesianHeight, interactionState, deltaT, cartesianWidth, config_1.drawCartesianBox, config_1.chartTopFontSize, dataState, emWidth, dpi, config.domainFrom, config.domainTo);
    const dataArrived = !dataState.pending &&
        (0, data_fetch_1.invalid)(dataState, dataDemand) &&
        dataDemand.lo &&
        dataDemand.hi &&
        dataDemand.binUnit &&
        dataDemand.binUnitCount;
    if (dataArrived) {
        dataState.pending = true;
    }
    return { dataArrived, yTweenOngoing, dataDemand };
};
const setupEventHandlers = (canvas, interactionState, timedRender, scheduleChartRender) => {
    const wheel = (e) => {
        const isPanning = e.metaKey;
        const wheeledDistanceRatio = e.deltaY / interactionState.horizontalScreenDimensions.innerSize;
        if (!inCartesianBand(interactionState.verticalScreenDimensions, (0, dom_1.zoomSafePointerY)(e)))
            return;
        if (isPanning) {
            const innerSizeRelativeDelta = wheeledDistanceRatio * config_1.wheelPanVelocity;
            (0, zoom_pan_1.doPanFromJumpDelta)(interactionState.horizontalZoomPan, -innerSizeRelativeDelta);
        }
        else {
            const desiredZoomChange = -wheeledDistanceRatio * config_1.wheelZoomVelocity;
            (0, zoom_pan_1.doZoomAroundPosition)(interactionState.horizontalZoomPan, interactionState.horizontalScreenDimensions, (0, dom_1.zoomSafePointerX)(e), desiredZoomChange, 0, false);
        }
        scheduleChartRender();
    };
    const dragStart = (e) => (0, zoom_pan_1.markDragStartPosition)(interactionState.horizontalZoomPan, (0, dom_1.zoomSafePointerX)(e));
    const kineticDragFlywheel = (t) => {
        const needsRerender = (0, zoom_pan_1.kineticFlywheel)(interactionState.horizontalZoomPan, interactionState.horizontalScreenDimensions.innerSize);
        if (needsRerender) {
            timedRender(t);
            window.requestAnimationFrame(kineticDragFlywheel);
        }
    };
    const dragEnd = () => {
        (0, zoom_pan_1.endDrag)(interactionState.horizontalZoomPan);
        window.requestAnimationFrame(kineticDragFlywheel);
    };
    const touchmove = (e) => {
        const shouldUpdate = touchUpdate(interactionState, (0, multitouch_1.touches)(e));
        if (shouldUpdate)
            scheduleChartRender();
    };
    const mousemove = (e) => {
        if (e.buttons !== 1)
            return;
        interactionState.multitouch = (0, multitouch_1.initialMultitouch)();
        const zoomPan = interactionState.horizontalZoomPan;
        (0, zoom_pan_1.resetTouchZoom)(zoomPan);
        if ((inCartesianBand(interactionState.horizontalScreenDimensions, (0, dom_1.zoomSafePointerX)(e)) &&
            inCartesianBand(interactionState.verticalScreenDimensions, (0, dom_1.zoomSafePointerY)(e))) ||
            (0, zoom_pan_1.touchOngoing)(zoomPan)) {
            if ((0, zoom_pan_1.panOngoing)(zoomPan)) {
                (0, zoom_pan_1.doPanFromPosition)(zoomPan, interactionState.horizontalScreenDimensions.innerSize, (0, dom_1.zoomSafePointerX)(e));
                scheduleChartRender();
            }
            else {
                dragStart(e);
            }
        }
    };
    const mousedown = (e) => inCartesianBand(interactionState.horizontalScreenDimensions, (0, dom_1.zoomSafePointerX)(e)) &&
        inCartesianBand(interactionState.verticalScreenDimensions, (0, dom_1.zoomSafePointerY)(e)) &&
        dragStart(e);
    const keydown = (e) => {
        var _a, _b;
        const panDirection = (_a = { ArrowLeft: -1, ArrowRight: 1 }[e.code]) !== null && _a !== void 0 ? _a : 0;
        const zoomDirection = (_b = { ArrowUp: -1, ArrowDown: 1 }[e.code]) !== null && _b !== void 0 ? _b : 0;
        if (panDirection || zoomDirection) {
            if (panDirection) {
                const normalizedDeltaPan = panDirection / config_1.keyPanVelocityDivisor;
                (0, zoom_pan_1.doPanFromJumpDelta)(interactionState.horizontalZoomPan, normalizedDeltaPan);
            }
            if (zoomDirection) {
                const normalizedDeltaZoom = zoomDirection / config_1.keyZoomVelocityDivisor;
                const center = 0.5;
                (0, zoom_pan_1.doZoomFromJumpDelta)(interactionState.horizontalZoomPan, normalizedDeltaZoom, center);
            }
            e.preventDefault();
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
};
const timeslipRender = (canvas, ctx, getData) => {
    const dpi = window.devicePixelRatio;
    const emWidth = ctx.measureText('mmmmmmmmmm').width / 10;
    const interactionState = getNullInteractionState();
    const dataState = (0, data_fetch_1.getNullDataState)();
    const chartWithUpdate = (t) => {
        const { dataArrived, yTweenOngoing, dataDemand } = chartWithTime(canvas, ctx, config_1.config, interactionState, dataState, t, dpi, emWidth);
        if (dataArrived)
            (0, data_fetch_1.updateDataState)(dataState, dataDemand, (0, data_1.getEnrichedData)(getData(dataDemand)));
        if (dataArrived || yTweenOngoing)
            scheduleChartRender();
    };
    const timedRender = (0, animation_1.withDeltaTime)(chartWithUpdate);
    const scheduleChartRender = (0, animation_1.withAnimation)(timedRender);
    scheduleChartRender();
    setupEventHandlers(canvas, interactionState, timedRender, scheduleChartRender);
};
exports.timeslipRender = timeslipRender;
//# sourceMappingURL=timeslip_render.js.map