"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortClosestToPoint = exports.isAllSeriesDeselected = exports.isChartAnimatable = exports.isLineAreaOnlyChart = exports.isVerticalRotation = exports.isHorizontalRotation = exports.MAX_ANIMATABLE_LINES_AREA_POINTS = exports.MAX_ANIMATABLE_BARS = void 0;
var common_1 = require("../../../../utils/common");
var specs_1 = require("../../utils/specs");
exports.MAX_ANIMATABLE_BARS = 300;
exports.MAX_ANIMATABLE_LINES_AREA_POINTS = 600;
function isHorizontalRotation(chartRotation) {
    return chartRotation === 0 || chartRotation === 180;
}
exports.isHorizontalRotation = isHorizontalRotation;
function isVerticalRotation(chartRotation) {
    return chartRotation === -90 || chartRotation === 90;
}
exports.isVerticalRotation = isVerticalRotation;
function isLineAreaOnlyChart(specs) {
    return !specs.some(function (spec) { return spec.seriesType === specs_1.SeriesType.Bar; });
}
exports.isLineAreaOnlyChart = isLineAreaOnlyChart;
function isChartAnimatable(geometriesCounts, animationEnabled) {
    if (!animationEnabled) {
        return false;
    }
    var bars = geometriesCounts.bars, linePoints = geometriesCounts.linePoints, areasPoints = geometriesCounts.areasPoints;
    var isBarsAnimatable = bars <= exports.MAX_ANIMATABLE_BARS;
    var isLinesAndAreasAnimatable = linePoints + areasPoints <= exports.MAX_ANIMATABLE_LINES_AREA_POINTS;
    return isBarsAnimatable && isLinesAndAreasAnimatable;
}
exports.isChartAnimatable = isChartAnimatable;
function isAllSeriesDeselected(legendItems) {
    var e_1, _a;
    try {
        for (var legendItems_1 = __values(legendItems), legendItems_1_1 = legendItems_1.next(); !legendItems_1_1.done; legendItems_1_1 = legendItems_1.next()) {
            var legendItem = legendItems_1_1.value;
            if (!legendItem.isSeriesHidden) {
                return false;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (legendItems_1_1 && !legendItems_1_1.done && (_a = legendItems_1.return)) _a.call(legendItems_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return true;
}
exports.isAllSeriesDeselected = isAllSeriesDeselected;
var sortClosestToPoint = function (cursor) {
    return function (a, b) {
        return (0, common_1.getDistance)(cursor, a) - (0, common_1.getDistance)(cursor, b);
    };
};
exports.sortClosestToPoint = sortClosestToPoint;
//# sourceMappingURL=common.js.map