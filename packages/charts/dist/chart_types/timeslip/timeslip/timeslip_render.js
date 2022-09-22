"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeslipRender = void 0;
var cached_chrono_1 = require("../../xy_chart/axes/timeslip/chrono/cached_chrono");
var rasters_1 = require("../../xy_chart/axes/timeslip/rasters");
var axis_model_1 = require("./axis_model");
var data_1 = require("./data");
var domain_tween_1 = require("./domain_tween");
var chart_title_1 = require("./render/annotations/chart_title");
var time_extent_1 = require("./render/annotations/time_extent");
var time_unit_1 = require("./render/annotations/time_unit");
var cartesian_1 = require("./render/cartesian");
var debug_box_1 = require("./render/glyphs/debug_box");
var dom_1 = require("./utils/dom");
var generator_1 = require("./utils/generator");
var math_1 = require("./utils/math");
var projection_1 = require("./utils/projection");
var panOngoing = function (interactionState) { return Number.isFinite(interactionState.dragStartX); };
var timeslipRender = function (canvas, ctx, getData) {
    var processAction = (0, generator_1.toCallbackFn)(handleEvents());
    var initialDarkMode = false;
    var drawCartesianBox = false;
    var singleValuedMetricsAggregationFunctionNames = {
        sum: 'value',
        min: 'minimum',
        max: 'maximum',
        avg: 'average',
        cardinality: 'cardinality',
        median_absolute_deviation: 'med abs dev',
        rate: 'rate',
        value_count: 'value count',
    };
    var aggregationFunctionNames = __assign({}, singleValuedMetricsAggregationFunctionNames);
    var metricFieldNames = ['machine.ram', 'bytes', 'memory'];
    var minZoom = 0;
    var maxZoom = 33;
    var lineThicknessSteps = [0.5, 0.75, 1, 1, 1, 1.25, 1.25, 1.5, 1.5, 1.75, 1.75, 2, 2, 2, 2, 2];
    var lumaSteps = [192, 72, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
    var smallFontSize = 12;
    var timeZone = 'Europe/Zurich';
    var themeLight = {
        defaultFontColor: 'black',
        subduedFontColor: '#393939',
        offHourFontColor: 'black',
        weekendFontColor: 'darkred',
        backgroundColor: { r: 255, g: 255, b: 255 },
        lumaSteps: lumaSteps,
    };
    var themeDark = {
        defaultFontColor: 'white',
        subduedFontColor: 'darkgrey',
        offHourFontColor: 'white',
        weekendFontColor: 'indianred',
        backgroundColor: { r: 0, g: 0, b: 0 },
        lumaSteps: lumaSteps.map(function (l) { return 255 - l; }),
    };
    var config = __assign(__assign(__assign({ darkMode: initialDarkMode, sparse: false, implicit: false, maxLabelRowCount: 3, queryConfig: {
            metricFieldName: metricFieldNames[0],
            aggregation: 'value_count',
            boxplot: false,
            window: 0,
            alpha: 0.4,
            beta: 0.2,
            gamma: 0.2,
            period: 1,
            multiplicative: false,
            binOffset: 0,
        }, a11y: {
            shortcuts: true,
            contrast: 'medium',
            animation: true,
            sonification: false,
        }, locale: 'en-US', numUnit: 'short' }, (initialDarkMode && themeDark)), (!initialDarkMode && themeLight)), { barChroma: { r: 96, g: 146, b: 192 }, barFillAlpha: 0.3, lineThicknessSteps: lineThicknessSteps, domainFrom: (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone: timeZone, year: 2012, month: 1, day: 1 })[cached_chrono_1.timeProp.epochSeconds], domainTo: (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone: timeZone, year: 2022, month: 1, day: 1 })[cached_chrono_1.timeProp.epochSeconds], minBinWidth: 'day', maxBinWidth: 'year', pixelRangeFrom: 100, pixelRangeTo: 500, tickLabelMaxProtrusionLeft: 0, tickLabelMaxProtrusionRight: 0, protrudeAxisLeft: true, protrudeAxisRight: true, smallFontSize: smallFontSize, cssFontShorthand: "normal normal 100 ".concat(smallFontSize, "px Inter, Helvetica, Arial, sans-serif"), monospacedFontShorthand: "normal normal 100 ".concat(smallFontSize, "px \"Roboto Mono\", Consolas, Menlo, Courier, monospace"), rowPixelPitch: 16, horizontalPixelOffset: 4, verticalPixelOffset: 6, minimumTickPixelDistance: 24, workHourMin: 6, workHourMax: 21, clipLeft: true, clipRight: true });
    var dpi = window.devicePixelRatio;
    var horizontalCartesianAreaPad = [0.04, 0.04];
    var verticalCartesianAreaPad = [0.12, 0.12];
    var interactionState = {
        zoom: 5.248,
        pan: 0.961,
        multitouch: [],
        dragStartX: NaN,
        zoomStart: NaN,
        panStart: NaN,
        lastDragX: NaN,
        dragVelocity: NaN,
        flyVelocity: NaN,
        niceDomainMin: NaN,
        niceDomainMax: NaN,
        screenDimensions: (0, dom_1.elementSizes)(canvas, horizontalCartesianAreaPad, verticalCartesianAreaPad),
        searchText: '',
    };
    var localeOptions = {
        hour12: false,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    var dataState = {
        valid: false,
        pending: false,
        lo: { year: Infinity, month: 12, day: 31, hour: 23, minute: 59, second: 59 },
        hi: { year: -Infinity, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
        binUnit: '',
        binUnitCount: NaN,
        queryConfig: {},
        dataResponse: { stats: {}, rows: [] },
    };
    var rasterSelector = (0, rasters_1.rasters)(config, timeZone);
    var defaultLabelFormat = new Intl.DateTimeFormat(config.locale, {
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: timeZone,
    }).format;
    var defaultMinorTickLabelFormat = new Intl.DateTimeFormat(config.locale, {
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: timeZone,
    }).format;
    var fadeOutPixelWidth = 12;
    var invalid = function (dataDemand) {
        return (!dataState.valid ||
            dataState.binUnit !== dataDemand.binUnit ||
            dataState.binUnitCount !== dataDemand.binUnitCount ||
            dataDemand.lo.timePointSec < dataState.lo.timePointSec ||
            dataDemand.hi.timePointSec > dataState.hi.timePointSec ||
            dataState.queryConfig !== JSON.stringify(config.queryConfig) ||
            dataState.searchText !== interactionState.searchText);
    };
    var updateDataState = function (dataDemand, config, dataResponse, interactionState) {
        dataState.pending = false;
        dataState.valid = true;
        dataState.lo = dataDemand.lo;
        dataState.hi = dataDemand.hi;
        dataState.binUnit = dataDemand.binUnit;
        dataState.binUnitCount = dataDemand.binUnitCount;
        dataState.queryConfig = JSON.stringify(config.queryConfig);
        dataState.dataResponse = dataResponse;
        dataState.searchText = interactionState.searchText;
    };
    var yTickNumberFormatter = new Intl.NumberFormat(config.locale, config.numUnit === 'none'
        ? {}
        : {
            notation: 'compact',
            compactDisplay: config.numUnit,
        });
    var ZERO_Y_BASE = true;
    var emWidth = ctx.measureText('mmmmmmmmmm').width / 10;
    var canvasWidth = NaN;
    var canvasHeight = NaN;
    var fromSec = config.domainFrom;
    var toSec = config.domainTo;
    var fullTimeExtent = toSec - fromSec;
    var zoomMultiplier = function () { return Math.pow(2, interactionState.zoom); };
    var rAF = -1;
    var prevT = 0;
    var timedRender = function (t) {
        var deltaT = t - prevT;
        prevT = t;
        chartWithTime(ctx, config, interactionState, deltaT);
    };
    function scheduleChartRender() {
        window.cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(timedRender);
    }
    function doCartesian(ctx, cartesianHeight, config, interactionState, deltaT, cartesianWidth, timeDomainFrom, timeDomainTo) {
        ctx.save();
        ctx.translate(0, cartesianHeight);
        var domainLandmarks = __spreadArray([
            dataState.dataResponse.stats.minValue,
            dataState.dataResponse.stats.maxValue
        ], __read((ZERO_Y_BASE ? [0] : [])), false);
        var desiredTickCount = (0, projection_1.getDesiredTickCount)(cartesianHeight, config.smallFontSize, config.sparse);
        var _a = (0, axis_model_1.axisModel)(domainLandmarks, desiredTickCount), niceDomainMin = _a.niceDomainMin, niceDomainMax = _a.niceDomainMax, niceTicks = _a.niceTicks;
        var yTweenOngoing = (0, domain_tween_1.domainTween)(interactionState, deltaT, niceDomainMin, niceDomainMax);
        var yUnitScale = (0, projection_1.axisScale)(interactionState.niceDomainMin, interactionState.niceDomainMax);
        var yUnitScaleClamped = function (d) { return (0, math_1.unitClamp)(yUnitScale(d)); };
        var dataDemand = (0, cartesian_1.renderCartesian)(ctx, config, dataState, config, defaultMinorTickLabelFormat, emWidth, fadeOutPixelWidth, defaultLabelFormat, yTickNumberFormatter, rasterSelector, cartesianWidth, cartesianHeight, {
            domainFrom: timeDomainFrom,
            domainTo: timeDomainTo,
        }, yUnitScale, yUnitScaleClamped, niceTicks);
        ctx.restore();
        return { yTweenOngoing: yTweenOngoing, dataDemand: dataDemand };
    }
    function getTimeDomain() {
        var pan = interactionState.pan;
        var zoomedTimeExtent = fullTimeExtent / zoomMultiplier();
        var leeway = fullTimeExtent - zoomedTimeExtent;
        var timeDomainFrom = fromSec + pan * leeway;
        var timeDomainTo = toSec - (1 - pan) * leeway;
        return { timeDomainFrom: timeDomainFrom, timeDomainTo: timeDomainTo };
    }
    function ensureCanvasElementSize(newCanvasWidth, newCanvasHeight) {
        if (newCanvasWidth !== canvasWidth) {
            canvas.setAttribute('width', String(newCanvasWidth));
            canvasWidth = newCanvasWidth;
        }
        if (newCanvasHeight !== canvasHeight) {
            canvas.setAttribute('height', String(newCanvasHeight));
            canvasHeight = newCanvasHeight;
        }
    }
    function renderChartWithTime(ctx, backgroundFillStyle, newCanvasWidth, newCanvasHeight, config, chartWidth, cartesianTop, aggregationFunctionName, cartesianLeft, cartesianHeight, interactionState, deltaT, cartesianWidth, timeDomainFrom, timeDomainTo, drawCartesianBox, chartTopFontSize) {
        ctx.save();
        ctx.scale(dpi, dpi);
        ctx.fillStyle = backgroundFillStyle;
        ctx.fillRect(0, 0, newCanvasWidth, newCanvasHeight);
        (0, chart_title_1.renderChartTitle)(ctx, config, chartWidth, cartesianTop, aggregationFunctionName);
        ctx.translate(cartesianLeft, cartesianTop);
        var _a = doCartesian(ctx, cartesianHeight, config, interactionState, deltaT, cartesianWidth, timeDomainFrom, timeDomainTo), yTweenOngoing = _a.yTweenOngoing, dataDemand = _a.dataDemand;
        if (drawCartesianBox) {
            (0, debug_box_1.renderDebugBox)(ctx, cartesianWidth, cartesianHeight);
        }
        (0, time_unit_1.renderTimeUnitAnnotation)(ctx, config, dataDemand.binUnitCount, dataDemand.binUnit, chartTopFontSize, dataDemand.unitBarMaxWidthPixels);
        (0, time_extent_1.renderTimeExtentAnnotation)(ctx, config, localeOptions, timeDomainFrom, timeDomainTo, cartesianWidth, chartTopFontSize);
        ctx.restore();
        return { yTweenOngoing: yTweenOngoing, dataDemand: dataDemand };
    }
    var dataArrived = function (_a) {
        var dataDemand = _a.dataDemand, dataResponse = _a.dataResponse;
        updateDataState(dataDemand, config, dataResponse, interactionState);
        scheduleChartRender();
    };
    function chartWithTime(ctx, config, interactionState, deltaT) {
        var _a = interactionState.screenDimensions, chartWidth = _a.outerWidth, chartHeight = _a.outerHeight, cartesianLeft = _a.innerLeft, cartesianWidth = _a.innerWidth, cartesianTop = _a.innerTop, cartesianHeight = _a.innerHeight;
        var _b = getTimeDomain(), timeDomainFrom = _b.timeDomainFrom, timeDomainTo = _b.timeDomainTo;
        var qc = config.queryConfig;
        var aggregationFunctionName = aggregationFunctionNames[qc.aggregation];
        var chartTopFontSize = config.smallFontSize + 2;
        var background = config.backgroundColor;
        var backgroundFillStyle = "rgba(".concat(background.r, ",").concat(background.g, ",").concat(background.b, ",1)");
        var newCanvasWidth = dpi * chartWidth;
        var newCanvasHeight = dpi * chartHeight;
        ensureCanvasElementSize(newCanvasWidth, newCanvasHeight);
        var _c = renderChartWithTime(ctx, backgroundFillStyle, newCanvasWidth, newCanvasHeight, config, chartWidth, cartesianTop, aggregationFunctionName, cartesianLeft, cartesianHeight, interactionState, deltaT, cartesianWidth, timeDomainFrom, timeDomainTo, drawCartesianBox, chartTopFontSize), yTweenOngoing = _c.yTweenOngoing, dataDemand = _c.dataDemand;
        if (!dataState.pending &&
            invalid(dataDemand) &&
            dataDemand.lo &&
            dataDemand.hi &&
            dataDemand.binUnit &&
            dataDemand.binUnitCount) {
            dataState.pending = true;
            processAction({
                dataDemand: dataDemand,
                target: data_1.dataSource,
                type: 'dataArrived',
                dataResponse: (0, data_1.getEnrichedData)(getData(dataDemand)),
            });
        }
        else if (yTweenOngoing) {
            scheduleChartRender();
        }
    }
    var setDomElements = function () {
        var chartSizeInfo = (0, dom_1.elementSizes)(canvas, horizontalCartesianAreaPad, verticalCartesianAreaPad);
        interactionState.screenDimensions = chartSizeInfo;
        var _a = config.backgroundColor, r = _a.r, g = _a.g, b = _a.b;
        var backgroundColorCSS = "rgb(".concat(r, ",").concat(g, ",").concat(b, ")");
        document.body.style.backgroundColor = backgroundColorCSS;
    };
    var fullRender = function () {
        setDomElements();
        scheduleChartRender();
    };
    fullRender();
    var getPanDeltaPerDragPixel = function () { return 1 / ((zoomMultiplier() - 1) * interactionState.screenDimensions.innerWidth); };
    var panFromDeltaPixel = function (panStart, delta) {
        var panDeltaPerDragPixel = getPanDeltaPerDragPixel();
        interactionState.pan = Math.max(0, Math.min(1, panStart - panDeltaPerDragPixel * delta)) || 0;
    };
    var inCartesianBand = function (e) {
        var y = (0, dom_1.zoomSafePointerY)(e);
        var _a = interactionState.screenDimensions, cartesianTop = _a.innerTop, cartesianBottom = _a.innerBottom;
        return cartesianTop <= y && y <= cartesianBottom;
    };
    var inCartesianArea = function (e) {
        var x = (0, dom_1.zoomSafePointerX)(e);
        var y = (0, dom_1.zoomSafePointerY)(e);
        var _a = interactionState.screenDimensions, innerTop = _a.innerTop, innerBottom = _a.innerBottom, innerLeft = _a.innerLeft, innerRight = _a.innerRight;
        return innerLeft <= x && x <= innerRight && innerTop <= y && y <= innerBottom;
    };
    var zoom = function (pointerUnitLocation, newZoom, panDelta) {
        if (panDelta === void 0) { panDelta = 0; }
        var oldInvisibleFraction = 1 - 1 / zoomMultiplier();
        interactionState.zoom = (0, math_1.clamp)(newZoom, minZoom, maxZoom);
        var newInvisibleFraction = 1 - 1 / zoomMultiplier();
        interactionState.pan =
            (0, math_1.unitClamp)((0, math_1.mix)(pointerUnitLocation + panDelta, interactionState.pan, oldInvisibleFraction / newInvisibleFraction)) || 0;
    };
    var zoomAroundX = function (centerX, newZoom, panDelta) {
        if (panDelta === void 0) { panDelta = 0; }
        var _a = interactionState.screenDimensions, cartesianWidth = _a.innerWidth, cartesianLeft = _a.innerLeft;
        var unitZoomCenter = Math.max(0, Math.min(cartesianWidth, centerX - cartesianLeft)) / cartesianWidth;
        zoom(unitZoomCenter, newZoom, panDelta);
    };
    var pan = function (normalizedDeltaPan) {
        var deltaPan = normalizedDeltaPan / Math.pow(2, interactionState.zoom);
        interactionState.pan = (0, math_1.unitClamp)(interactionState.pan + deltaPan) || 0;
    };
    var dragVelocityAttenuation = 0.92;
    var wheelPanVelocityDivisor = 1000;
    var wheelZoomVelocityDivisor = 250;
    var keyZoomVelocityDivisor = 2;
    var keyPanVelocityDivisor = 10;
    var wheel = function (e) {
        if (!inCartesianBand(e))
            return;
        if (e.metaKey) {
            pan(-e.deltaY / wheelPanVelocityDivisor);
        }
        else {
            var centerX = (0, dom_1.zoomSafePointerX)(e);
            var newZoom = interactionState.zoom - e.deltaY / wheelZoomVelocityDivisor;
            zoomAroundX(centerX, newZoom);
        }
        scheduleChartRender();
    };
    var dragStartAtX = function (startingX) {
        interactionState.dragStartX = startingX;
        interactionState.lastDragX = startingX;
        interactionState.dragVelocity = NaN;
        interactionState.flyVelocity = NaN;
        interactionState.panStart = interactionState.pan;
    };
    var dragStart = function (e) { return dragStartAtX((0, dom_1.zoomSafePointerX)(e)); };
    var kineticDragHandler = function (t) {
        var velocity = interactionState.flyVelocity;
        if (Math.abs(velocity) > 0.01) {
            panFromDeltaPixel(interactionState.pan, velocity);
            interactionState.flyVelocity *= dragVelocityAttenuation;
            timedRender(t);
            window.requestAnimationFrame(kineticDragHandler);
        }
        else {
            interactionState.flyVelocity = NaN;
        }
    };
    var dragEnd = function () {
        interactionState.flyVelocity = interactionState.dragVelocity;
        interactionState.dragVelocity = NaN;
        interactionState.dragStartX = NaN;
        interactionState.panStart = NaN;
        window.requestAnimationFrame(kineticDragHandler);
    };
    var panFromX = function (currentX) {
        var deltaX = currentX - interactionState.lastDragX;
        var dragVelocity = interactionState.dragVelocity;
        interactionState.dragVelocity =
            deltaX * dragVelocity > 0 && Math.abs(deltaX) < Math.abs(dragVelocity)
                ? dragVelocity
                : deltaX;
        interactionState.lastDragX = currentX;
        var delta = currentX - interactionState.dragStartX;
        panFromDeltaPixel(interactionState.panStart, delta);
        return delta;
    };
    var touchMidpoint = function (multitouch) { return (multitouch[0].x + multitouch[1].x) / 2; };
    var touchmove = function (e) {
        var _a;
        var multitouch = __spreadArray([], __read(((_a = e.touches) !== null && _a !== void 0 ? _a : [])), false).map(function (t) { return ({
            id: t.identifier,
            x: (0, dom_1.zoomSafePointerX)(t),
        }); })
            .sort(function (_a, _b) {
            var a = _a.x;
            var b = _b.x;
            return a - b;
        });
        if (interactionState.multitouch.length === 0 && multitouch.length === 2) {
            interactionState.multitouch = multitouch;
            interactionState.zoomStart = interactionState.zoom;
            var centerX = touchMidpoint(multitouch);
            dragStartAtX(centerX);
        }
        else if (multitouch.length !== 2 ||
            __spreadArray(__spreadArray([], __read(multitouch), false), __read(interactionState.multitouch), false).filter(function (t, i, a) { return a.findIndex(function (tt) { return tt.id === t.id; }) === i; })
                .length !== 2) {
            interactionState.multitouch = [];
            interactionState.zoomStart = NaN;
        }
        if (interactionState.multitouch.length === 2) {
            var centerX = touchMidpoint(multitouch);
            var zoomMultiplier_1 = (multitouch[1].x - multitouch[0].x) / (interactionState.multitouch[1].x - interactionState.multitouch[0].x);
            var panDelta = 0;
            zoomAroundX(centerX, interactionState.zoomStart + Math.log2(zoomMultiplier_1), panDelta);
            scheduleChartRender();
        }
        else if (inCartesianArea(e) || Number.isFinite(interactionState.panStart)) {
            if (!panOngoing(interactionState)) {
                dragStart(e);
            }
            else {
                var currentX = (0, dom_1.zoomSafePointerX)(e);
                panFromX(currentX);
                scheduleChartRender();
            }
        }
    };
    var touchstart = function (e) { return inCartesianArea(e) && dragStart(e); };
    var touchend = dragEnd;
    var mousedown = touchstart;
    var mousemove = function (e) { return e.buttons === 1 && touchmove(e); };
    var mouseup = touchend;
    var touchcancel = touchend;
    var chartKeydown = function (e) {
        var panDirection = { ArrowLeft: -1, ArrowRight: 1 }[e.code];
        var zoomDirection = { ArrowUp: -1, ArrowDown: 1 }[e.code];
        if (panDirection || zoomDirection) {
            if (panDirection)
                pan(panDirection / keyPanVelocityDivisor);
            if (zoomDirection)
                zoom(0.5, interactionState.zoom + zoomDirection / keyZoomVelocityDivisor);
            e.preventDefault();
            scheduleChartRender();
        }
    };
    var resize = function () { return fullRender(); };
    var eventHandlersForWindow = { resize: resize };
    var eventHandlersForCanvas = {
        wheel: wheel,
        mousemove: mousemove,
        mousedown: mousedown,
        mouseup: mouseup,
        touchmove: touchmove,
        touchstart: touchstart,
        touchend: touchend,
        touchcancel: touchcancel,
        keydown: chartKeydown,
    };
    var eventHandlersForData = { dataArrived: dataArrived };
    var eventHandlers = new Map([
        [window, eventHandlersForWindow],
        [canvas, eventHandlersForCanvas],
        [data_1.dataSource, eventHandlersForData],
    ]);
    function handleEvents() {
        var e, handler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4];
                case 1:
                    e = _a.sent();
                    handler = eventHandlers.get(e.target)[e.type];
                    if (handler)
                        handler(e);
                    _a.label = 2;
                case 2: return [3, 0];
                case 3: return [2];
            }
        });
    }
    (0, generator_1.observe)(window, processAction, eventHandlersForWindow);
    (0, generator_1.observe)(canvas, processAction, eventHandlersForCanvas);
};
exports.timeslipRender = timeslipRender;
//# sourceMappingURL=timeslip_render.js.map