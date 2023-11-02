"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortClosestToPoint = exports.isAllSeriesDeselected = exports.isChartAnimatable = exports.isLineAreaOnlyChart = exports.isVerticalRotation = exports.isHorizontalRotation = exports.MAX_ANIMATABLE_LINES_AREA_POINTS = exports.MAX_ANIMATABLE_BARS = void 0;
const common_1 = require("../../../../utils/common");
const specs_1 = require("../../utils/specs");
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
    return !specs.some((spec) => spec.seriesType === specs_1.SeriesType.Bar);
}
exports.isLineAreaOnlyChart = isLineAreaOnlyChart;
function isChartAnimatable(geometriesCounts, animationEnabled) {
    if (!animationEnabled) {
        return false;
    }
    const { bars, linePoints, areasPoints } = geometriesCounts;
    const isBarsAnimatable = bars <= exports.MAX_ANIMATABLE_BARS;
    const isLinesAndAreasAnimatable = linePoints + areasPoints <= exports.MAX_ANIMATABLE_LINES_AREA_POINTS;
    return isBarsAnimatable && isLinesAndAreasAnimatable;
}
exports.isChartAnimatable = isChartAnimatable;
function isAllSeriesDeselected(legendItems) {
    for (const legendItem of legendItems) {
        if (!legendItem.isSeriesHidden) {
            return false;
        }
    }
    return true;
}
exports.isAllSeriesDeselected = isAllSeriesDeselected;
const sortClosestToPoint = (cursor) => (a, b) => {
    return (0, common_1.getDistance)(cursor, a) - (0, common_1.getDistance)(cursor, b);
};
exports.sortClosestToPoint = sortClosestToPoint;
//# sourceMappingURL=common.js.map