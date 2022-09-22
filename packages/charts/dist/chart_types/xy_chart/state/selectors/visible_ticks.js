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
exports.getVisibleTickSetsSelector = exports.generateTicks = void 0;
var scales_1 = require("../../../../scales");
var constants_1 = require("../../../../scales/constants");
var types_1 = require("../../../../scales/types");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
var common_1 = require("../../../../utils/common");
var multilayer_ticks_1 = require("../../axes/timeslip/multilayer_ticks");
var axis_type_utils_1 = require("../../utils/axis_type_utils");
var panel_1 = require("../../utils/panel");
var scales_2 = require("../../utils/scales");
var compute_axis_ticks_dimensions_1 = require("./compute_axis_ticks_dimensions");
var compute_series_domains_1 = require("./compute_series_domains");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var count_bars_in_cluster_1 = require("./count_bars_in_cluster");
var get_bar_paddings_1 = require("./get_bar_paddings");
var is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
var adaptiveTickCount = true;
function axisMinMax(axisPosition, chartRotation, _a) {
    var width = _a.width, height = _a.height;
    var horizontal = (0, axis_type_utils_1.isHorizontalAxis)(axisPosition);
    var flipped = horizontal
        ? chartRotation === -90 || chartRotation === 180
        : chartRotation === 90 || chartRotation === 180;
    return horizontal ? [flipped ? width : 0, flipped ? 0 : width] : [flipped ? 0 : height, flipped ? height : 0];
}
function getDirectionFn(_a) {
    var type = _a.type;
    return type === constants_1.ScaleType.Ordinal
        ? function (label) { return ((0, common_1.isRTLString)(label) ? 'rtl' : 'ltr'); }
        : function () { return 'ltr'; };
}
function generateTicks(axisSpec, scale, ticks, offset, labelFormatter, layer, detailedLayer, showGrid) {
    var getDirection = getDirectionFn(scale);
    var isContinuous = (0, types_1.isContinuousScale)(scale);
    return ticks.map(function (value) {
        var domainClampedValue = isContinuous && typeof value === 'number' ? Math.max(value, scale.domain[0]) : value;
        var label = labelFormatter(value);
        return {
            value: value,
            domainClampedValue: domainClampedValue,
            label: label,
            position: (scale.scale(value) || 0) + offset,
            domainClampedPosition: (scale.scale(domainClampedValue) || 0) + offset,
            layer: layer,
            detailedLayer: detailedLayer,
            showGrid: showGrid,
            direction: getDirection(label),
        };
    });
}
exports.generateTicks = generateTicks;
function getVisibleTicks(axisSpec, labelBox, totalBarsInCluster, labelFormatter, rotationOffset, scale, enableHistogramMode, layer, detailedLayer, ticks, isMultilayerTimeAxis, showGrid) {
    if (isMultilayerTimeAxis === void 0) { isMultilayerTimeAxis = false; }
    if (showGrid === void 0) { showGrid = true; }
    var isSingleValueScale = scale.domain[0] === scale.domain[1];
    var makeRaster = enableHistogramMode && scale.bandwidth > 0 && !isMultilayerTimeAxis;
    var ultimateTick = ticks[ticks.length - 1];
    var penultimateTick = ticks[ticks.length - 2];
    if (makeRaster && !isSingleValueScale && typeof penultimateTick === 'number' && typeof ultimateTick === 'number') {
        var computedTickDistance = ultimateTick - penultimateTick;
        var numTicks = scale.minInterval / (computedTickDistance || scale.minInterval);
        for (var i = 1; i <= numTicks; i++)
            ticks.push(i * computedTickDistance + ultimateTick);
    }
    var shift = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
    var band = scale.bandwidth / (1 - scale.barsPadding);
    var halfPadding = (band - scale.bandwidth) / 2;
    var offset = (enableHistogramMode ? -halfPadding : (scale.bandwidth * shift) / 2) + (scale.isSingleValue() ? 0 : rotationOffset);
    var firstTickValue = ticks[0];
    var allTicks = makeRaster && isSingleValueScale && typeof firstTickValue === 'number'
        ? [
            {
                value: firstTickValue,
                domainClampedValue: firstTickValue,
                label: labelFormatter(firstTickValue),
                position: (scale.scale(firstTickValue) || 0) + offset,
                domainClampedPosition: (scale.scale(firstTickValue) || 0) + offset,
                layer: undefined,
                detailedLayer: 0,
                direction: 'rtl',
                showGrid: showGrid,
            },
            {
                value: firstTickValue + scale.minInterval,
                domainClampedValue: firstTickValue + scale.minInterval,
                label: labelFormatter(firstTickValue + scale.minInterval),
                position: scale.bandwidth + halfPadding * 2,
                domainClampedPosition: scale.bandwidth + halfPadding * 2,
                layer: undefined,
                detailedLayer: 0,
                direction: 'rtl',
                showGrid: showGrid,
            },
        ]
        : generateTicks(axisSpec, scale, ticks, offset, labelFormatter, layer, detailedLayer, showGrid);
    var showOverlappingTicks = axisSpec.showOverlappingTicks, showOverlappingLabels = axisSpec.showOverlappingLabels, position = axisSpec.position;
    var requiredSpace = (0, axis_type_utils_1.isVerticalAxis)(position) ? labelBox.maxLabelBboxHeight / 2 : labelBox.maxLabelBboxWidth / 2;
    var bypassOverlapCheck = showOverlappingLabels || isMultilayerTimeAxis;
    return bypassOverlapCheck
        ? allTicks
        : __spreadArray([], __read(allTicks), false).sort(function (a, b) { return a.position - b.position; })
            .reduce(function (prev, tick) {
            var tickLabelFits = tick.position >= prev.occupiedSpace + requiredSpace;
            if (tickLabelFits || showOverlappingTicks) {
                prev.visibleTicks.push(tickLabelFits ? tick : __assign(__assign({}, tick), { label: '' }));
                if (tickLabelFits)
                    prev.occupiedSpace = tick.position + requiredSpace;
            }
            else if (adaptiveTickCount && !tickLabelFits && !showOverlappingTicks) {
                prev.visibleTicks.push(__assign(__assign({}, tick), { label: '' }));
            }
            return prev;
        }, { visibleTicks: [], occupiedSpace: -Infinity }).visibleTicks;
}
function getVisibleTickSet(scale, labelBox, _a, axisSpec, groupCount, histogramMode, layer, detailedLayer, ticks, labelFormatter, isMultilayerTimeAxis, showGrid) {
    var chartRotation = _a.rotation;
    if (isMultilayerTimeAxis === void 0) { isMultilayerTimeAxis = false; }
    if (showGrid === void 0) { showGrid = true; }
    var vertical = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position);
    var somehowRotated = (vertical && chartRotation === -90) || (!vertical && chartRotation === 180);
    var rotationOffset = histogramMode && somehowRotated ? scale.step : 0;
    return getVisibleTicks(axisSpec, labelBox, groupCount, labelFormatter, rotationOffset, scale, histogramMode, layer, detailedLayer, ticks, isMultilayerTimeAxis, showGrid);
}
exports.getVisibleTickSetsSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_settings_spec_1.getSettingsSpecSelector,
    compute_axis_ticks_dimensions_1.getJoinedVisibleAxesData,
    compute_series_domains_1.computeSeriesDomainsSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    count_bars_in_cluster_1.countBarsInClusterSelector,
    is_histogram_mode_enabled_1.isHistogramModeEnabledSelector,
    get_bar_paddings_1.getBarPaddingsSelector,
], getVisibleTickSets);
function getVisibleTickSets(_a, joinedAxesData, _b, smScales, totalGroupsCount, enableHistogramMode, barsPadding) {
    var chartRotation = _a.rotation;
    var xDomain = _b.xDomain, yDomains = _b.yDomains;
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)(function (textMeasure) {
        var panel = (0, panel_1.getPanelSize)(smScales);
        return __spreadArray([], __read(joinedAxesData), false).reduce(function (acc, _a) {
            var _b;
            var _c = __read(_a, 2), axisId = _c[0], _d = _c[1], axisSpec = _d.axisSpec, axesStyle = _d.axesStyle, gridLine = _d.gridLine, isXAxis = _d.isXAxis, userProvidedLabelFormatter = _d.labelFormatter;
            var groupId = axisSpec.groupId, integersOnly = axisSpec.integersOnly, timeAxisLayerCount = axisSpec.timeAxisLayerCount;
            var yDomain = yDomains.find(function (yd) { return yd.groupId === groupId; });
            var domain = isXAxis ? xDomain : yDomain;
            var range = axisMinMax(axisSpec.position, chartRotation, panel);
            var maxTickCount = (_b = domain === null || domain === void 0 ? void 0 : domain.desiredTickCount) !== null && _b !== void 0 ? _b : 0;
            var isMultilayerTimeAxis = (domain === null || domain === void 0 ? void 0 : domain.type) === constants_1.ScaleType.Time && timeAxisLayerCount > 0;
            var getMeasuredTicks = function (scale, ticks, layer, detailedLayer, labelFormatter, showGrid) {
                if (showGrid === void 0) { showGrid = true; }
                var labelBox = (0, compute_axis_ticks_dimensions_1.getLabelBox)(axesStyle, ticks, labelFormatter, textMeasure, axisSpec, gridLine);
                return {
                    ticks: getVisibleTickSet(scale, labelBox, { rotation: chartRotation }, axisSpec, totalGroupsCount, enableHistogramMode, layer, detailedLayer, ticks, labelFormatter, isMultilayerTimeAxis, showGrid),
                    labelBox: labelBox,
                    scale: scale,
                };
            };
            var getScale = function (desiredTickCount) {
                return isXAxis
                    ? (0, scales_2.computeXScale)({
                        xDomain: __assign(__assign({}, xDomain), { desiredTickCount: desiredTickCount }),
                        totalBarsInCluster: totalGroupsCount,
                        range: range,
                        barsPadding: barsPadding,
                        enableHistogramMode: enableHistogramMode,
                        integersOnly: integersOnly,
                    })
                    : yDomain && new scales_1.ScaleContinuous(__assign(__assign({}, yDomain), { range: range }), __assign(__assign({}, yDomain), { desiredTickCount: desiredTickCount, integersOnly: integersOnly }));
            };
            var fillLayer = function (maxTickCountForLayer) {
                var _a;
                var fallbackAskedTickCount = 2;
                var fallbackReceivedTickCount = Infinity;
                if (adaptiveTickCount) {
                    var previousActualTickCount = NaN;
                    for (var triedTickCount = maxTickCountForLayer; triedTickCount >= 1; triedTickCount--) {
                        var scale_1 = getScale(triedTickCount);
                        var actualTickCount = (_a = scale_1 === null || scale_1 === void 0 ? void 0 : scale_1.ticks().length) !== null && _a !== void 0 ? _a : 0;
                        if (!scale_1 || actualTickCount === previousActualTickCount || actualTickCount < 2)
                            continue;
                        var raster = getMeasuredTicks(scale_1, scale_1.ticks(), undefined, 0, userProvidedLabelFormatter);
                        var nonZeroLengthTicks = raster.ticks.filter(function (tick) { return tick.label.length > 0; });
                        var uniqueLabels = new Set(raster.ticks.map(function (tick) { return tick.label; }));
                        var areLabelsUnique = raster.ticks.length === uniqueLabels.size;
                        var areAdjacentTimeLabelsUnique = scale_1.type === constants_1.ScaleType.Time &&
                            !axisSpec.showDuplicatedTicks &&
                            (areLabelsUnique || raster.ticks.every(function (d, i, a) { return i === 0 || d.label !== a[i - 1].label; }));
                        var atLeastTwoTicks = uniqueLabels.size >= 2;
                        var allTicksFit = !uniqueLabels.has('');
                        var compliant = axisSpec &&
                            (scale_1.type === constants_1.ScaleType.Time || atLeastTwoTicks) &&
                            (scale_1.type === constants_1.ScaleType.Log || allTicksFit) &&
                            ((scale_1.type === constants_1.ScaleType.Time && (axisSpec.showDuplicatedTicks || areAdjacentTimeLabelsUnique)) ||
                                (scale_1.type === constants_1.ScaleType.Log
                                    ? new Set(nonZeroLengthTicks.map(function (tick) { return tick.label; })).size === nonZeroLengthTicks.length
                                    : areLabelsUnique));
                        previousActualTickCount = actualTickCount;
                        if (raster && compliant) {
                            return {
                                entry: __assign(__assign({}, raster), { ticks: scale_1.type === constants_1.ScaleType.Log ? raster.ticks : nonZeroLengthTicks }),
                                fallbackAskedTickCount: fallbackAskedTickCount,
                            };
                        }
                        else if (atLeastTwoTicks && uniqueLabels.size <= fallbackReceivedTickCount) {
                            fallbackReceivedTickCount = uniqueLabels.size;
                            fallbackAskedTickCount = triedTickCount;
                        }
                    }
                }
                return { fallbackAskedTickCount: fallbackAskedTickCount };
            };
            if (isMultilayerTimeAxis) {
                var scale_2 = getScale(0);
                if (!scale_2 || !(0, types_1.isContinuousScale)(scale_2))
                    throw new Error('Scale generation for the multilayer axis failed');
                return acc.set(axisId, (0, multilayer_ticks_1.multilayerAxisEntry)(xDomain, isXAxis && xDomain.isBandScale && enableHistogramMode, range, timeAxisLayerCount, scale_2, getMeasuredTicks));
            }
            var _e = fillLayer(maxTickCount), fallbackAskedTickCount = _e.fallbackAskedTickCount, entry = _e.entry;
            if (entry)
                return acc.set(axisId, entry);
            var scale = getScale(adaptiveTickCount ? fallbackAskedTickCount : maxTickCount);
            var lastResortCandidate = scale && getMeasuredTicks(scale, scale.ticks(), undefined, 0, userProvidedLabelFormatter);
            return lastResortCandidate ? acc.set(axisId, lastResortCandidate) : acc;
        }, new Map());
    });
}
//# sourceMappingURL=visible_ticks.js.map