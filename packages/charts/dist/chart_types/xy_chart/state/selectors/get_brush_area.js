"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrushForBothAxis = exports.getBrushForYAxis = exports.getBrushForXAxis = exports.getPlotAreaRestrictedPoint = exports.getPointsConstraintToSinglePanel = exports.getBrushAreaSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const common_1 = require("../../../../utils/common");
const common_2 = require("../utils/common");
const MIN_AREA_SIZE = 1;
const getMouseDownPosition = (state) => { var _a; return (_a = state.interactions.pointer.down) === null || _a === void 0 ? void 0 : _a.position; };
const getCurrentPointerPosition = (state) => state.interactions.pointer.current.position;
exports.getBrushAreaSelector = (0, create_selector_1.createCustomCachedSelector)([
    getMouseDownPosition,
    getCurrentPointerPosition,
    get_chart_rotation_1.getChartRotationSelector,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
], (start, end, chartRotation, { chartDimensions }, { brushAxis }, smallMultipleScales) => {
    if (!start) {
        return null;
    }
    const plotStartPointPx = getPlotAreaRestrictedPoint(start, chartDimensions);
    const plotEndPointPx = getPlotAreaRestrictedPoint(end, chartDimensions);
    const panelPoints = getPointsConstraintToSinglePanel(plotStartPointPx, plotEndPointPx, smallMultipleScales);
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
function getPointsConstraintToSinglePanel(startPlotPoint, endPlotPoint, { horizontal, vertical }) {
    const hPanel = horizontal.invert(startPlotPoint.x);
    const vPanel = vertical.invert(startPlotPoint.y);
    const hPanelStart = (!(0, common_1.isNil)(hPanel) && horizontal.scale(hPanel)) || 0;
    const hPanelEnd = hPanelStart + horizontal.bandwidth;
    const vPanelStart = (!(0, common_1.isNil)(vPanel) && vertical.scale(vPanel)) || 0;
    const vPanelEnd = vPanelStart + vertical.bandwidth;
    const start = {
        x: (0, common_1.clamp)(startPlotPoint.x, hPanelStart, hPanelEnd),
        y: (0, common_1.clamp)(startPlotPoint.y, vPanelStart, vPanelEnd),
    };
    const end = {
        x: (0, common_1.clamp)(endPlotPoint.x, hPanelStart, hPanelEnd),
        y: (0, common_1.clamp)(endPlotPoint.y, vPanelStart, vPanelEnd),
    };
    return {
        start,
        end,
        hPanelStart,
        hPanelWidth: horizontal.bandwidth,
        vPanelStart,
        vPanelHeight: vertical.bandwidth,
    };
}
exports.getPointsConstraintToSinglePanel = getPointsConstraintToSinglePanel;
function getPlotAreaRestrictedPoint({ x, y }, { left, top }) {
    return {
        x: x - left,
        y: y - top,
    };
}
exports.getPlotAreaRestrictedPoint = getPlotAreaRestrictedPoint;
function getBrushForXAxis(chartRotation, { hPanelStart, vPanelStart, hPanelWidth, vPanelHeight, start, end }) {
    const rotated = (0, common_2.isVerticalRotation)(chartRotation);
    return {
        left: rotated ? hPanelStart : start.x,
        top: rotated ? start.y : vPanelStart,
        height: rotated ? getMinSize(start.y, end.y) : vPanelHeight,
        width: rotated ? hPanelWidth : getMinSize(start.x, end.x),
    };
}
exports.getBrushForXAxis = getBrushForXAxis;
function getBrushForYAxis(chartRotation, { hPanelStart, vPanelStart, hPanelWidth, vPanelHeight, start, end }) {
    const rotated = (0, common_2.isVerticalRotation)(chartRotation);
    return {
        left: rotated ? start.x : hPanelStart,
        top: rotated ? vPanelStart : start.y,
        height: rotated ? vPanelHeight : getMinSize(start.y, end.y),
        width: rotated ? getMinSize(start.x, end.x) : hPanelWidth,
    };
}
exports.getBrushForYAxis = getBrushForYAxis;
function getBrushForBothAxis({ start, end }) {
    return {
        left: start.x,
        top: start.y,
        height: getMinSize(start.y, end.y),
        width: getMinSize(start.x, end.x),
    };
}
exports.getBrushForBothAxis = getBrushForBothAxis;
function getMinSize(a, b, minSize = MIN_AREA_SIZE) {
    const size = b - a;
    if (Math.abs(size) < minSize) {
        return minSize;
    }
    return size;
}
//# sourceMappingURL=get_brush_area.js.map