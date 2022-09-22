"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrushForBothAxis = exports.getBrushForYAxis = exports.getBrushForXAxis = exports.getPlotAreaRestrictedPoint = exports.getPointsConstraintToSinglePanel = exports.getBrushAreaSelector = void 0;
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var common_1 = require("../../../../utils/common");
var common_2 = require("../utils/common");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var MIN_AREA_SIZE = 1;
var getMouseDownPosition = function (state) { var _a; return (_a = state.interactions.pointer.down) === null || _a === void 0 ? void 0 : _a.position; };
var getCurrentPointerPosition = function (state) { return state.interactions.pointer.current.position; };
exports.getBrushAreaSelector = (0, create_selector_1.createCustomCachedSelector)([
    getMouseDownPosition,
    getCurrentPointerPosition,
    get_chart_rotation_1.getChartRotationSelector,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
], function (start, end, chartRotation, _a, _b, smallMultipleScales) {
    var chartDimensions = _a.chartDimensions;
    var brushAxis = _b.brushAxis;
    if (!start) {
        return null;
    }
    var plotStartPointPx = getPlotAreaRestrictedPoint(start, chartDimensions);
    var plotEndPointPx = getPlotAreaRestrictedPoint(end, chartDimensions);
    var panelPoints = getPointsConstraintToSinglePanel(plotStartPointPx, plotEndPointPx, smallMultipleScales);
    switch (brushAxis) {
        case constants_1.BrushAxis.Y:
            return getBrushForYAxis(chartRotation, panelPoints);
        case constants_1.BrushAxis.Both:
            return getBrushForBothAxis(panelPoints);
        case constants_1.BrushAxis.X:
        default:
            return getBrushForXAxis(chartRotation, panelPoints);
    }
});
function getPointsConstraintToSinglePanel(startPlotPoint, endPlotPoint, _a) {
    var horizontal = _a.horizontal, vertical = _a.vertical;
    var hPanel = horizontal.invert(startPlotPoint.x);
    var vPanel = vertical.invert(startPlotPoint.y);
    var hPanelStart = (!(0, common_1.isNil)(hPanel) && horizontal.scale(hPanel)) || 0;
    var hPanelEnd = hPanelStart + horizontal.bandwidth;
    var vPanelStart = (!(0, common_1.isNil)(vPanel) && vertical.scale(vPanel)) || 0;
    var vPanelEnd = vPanelStart + vertical.bandwidth;
    var start = {
        x: (0, common_1.clamp)(startPlotPoint.x, hPanelStart, hPanelEnd),
        y: (0, common_1.clamp)(startPlotPoint.y, vPanelStart, vPanelEnd),
    };
    var end = {
        x: (0, common_1.clamp)(endPlotPoint.x, hPanelStart, hPanelEnd),
        y: (0, common_1.clamp)(endPlotPoint.y, vPanelStart, vPanelEnd),
    };
    return {
        start: start,
        end: end,
        hPanelStart: hPanelStart,
        hPanelWidth: horizontal.bandwidth,
        vPanelStart: vPanelStart,
        vPanelHeight: vertical.bandwidth,
    };
}
exports.getPointsConstraintToSinglePanel = getPointsConstraintToSinglePanel;
function getPlotAreaRestrictedPoint(_a, _b) {
    var x = _a.x, y = _a.y;
    var left = _b.left, top = _b.top;
    return {
        x: x - left,
        y: y - top,
    };
}
exports.getPlotAreaRestrictedPoint = getPlotAreaRestrictedPoint;
function getBrushForXAxis(chartRotation, _a) {
    var hPanelStart = _a.hPanelStart, vPanelStart = _a.vPanelStart, hPanelWidth = _a.hPanelWidth, vPanelHeight = _a.vPanelHeight, start = _a.start, end = _a.end;
    var rotated = (0, common_2.isVerticalRotation)(chartRotation);
    return {
        left: rotated ? hPanelStart : start.x,
        top: rotated ? start.y : vPanelStart,
        height: rotated ? getMinSize(start.y, end.y) : vPanelHeight,
        width: rotated ? hPanelWidth : getMinSize(start.x, end.x),
    };
}
exports.getBrushForXAxis = getBrushForXAxis;
function getBrushForYAxis(chartRotation, _a) {
    var hPanelStart = _a.hPanelStart, vPanelStart = _a.vPanelStart, hPanelWidth = _a.hPanelWidth, vPanelHeight = _a.vPanelHeight, start = _a.start, end = _a.end;
    var rotated = (0, common_2.isVerticalRotation)(chartRotation);
    return {
        left: rotated ? start.x : hPanelStart,
        top: rotated ? vPanelStart : start.y,
        height: rotated ? vPanelHeight : getMinSize(start.y, end.y),
        width: rotated ? getMinSize(start.x, end.x) : hPanelWidth,
    };
}
exports.getBrushForYAxis = getBrushForYAxis;
function getBrushForBothAxis(_a) {
    var start = _a.start, end = _a.end;
    return {
        left: start.x,
        top: start.y,
        height: getMinSize(start.y, end.y),
        width: getMinSize(start.x, end.x),
    };
}
exports.getBrushForBothAxis = getBrushForBothAxis;
function getMinSize(a, b, minSize) {
    if (minSize === void 0) { minSize = MIN_AREA_SIZE; }
    var size = b - a;
    if (Math.abs(size) < minSize) {
        return minSize;
    }
    return size;
}
//# sourceMappingURL=get_brush_area.js.map