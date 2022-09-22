"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnBrushEndCaller = void 0;
var __1 = require("../../..");
var types_1 = require("../../../../scales/types");
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var common_1 = require("../../../../utils/common");
var events_1 = require("../../../../utils/events");
var y_domain_1 = require("../../domains/y_domain");
var common_2 = require("../utils/common");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var get_brush_area_1 = require("./get_brush_area");
var get_computed_scales_1 = require("./get_computed_scales");
var get_specs_1 = require("./get_specs");
var is_brush_available_1 = require("./is_brush_available");
var is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
var getLastDragSelector = function (state) { return state.interactions.pointer.lastDrag; };
function createOnBrushEndCaller() {
    var prevProps = null;
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.XYAxis) {
            if (!(0, is_brush_available_1.isBrushAvailableSelector)(state)) {
                selector = null;
                prevProps = null;
                return;
            }
            selector = (0, create_selector_1.createCustomCachedSelector)([
                getLastDragSelector,
                get_settings_spec_1.getSettingsSpecSelector,
                get_computed_scales_1.getComputedScalesSelector,
                compute_chart_dimensions_1.computeChartDimensionsSelector,
                is_histogram_mode_enabled_1.isHistogramModeEnabledSelector,
                compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
                get_specs_1.getSeriesSpecsSelector,
            ], function (lastDrag, _a, computedScales, _b, histogramMode, smallMultipleScales, seriesSpec) {
                var onBrushEnd = _a.onBrushEnd, rotation = _a.rotation, brushAxis = _a.brushAxis, minBrushDelta = _a.minBrushDelta, roundHistogramBrushValues = _a.roundHistogramBrushValues, allowBrushingLastHistogramBin = _a.allowBrushingLastHistogramBin;
                var chartDimensions = _b.chartDimensions;
                var nextProps = {
                    lastDrag: lastDrag,
                    onBrushEnd: onBrushEnd,
                };
                var yScales = computedScales.yScales, xScale = computedScales.xScale;
                if (lastDrag !== null && (0, events_1.hasDragged)(prevProps, nextProps) && onBrushEnd && (0, types_1.isContinuousScale)(xScale)) {
                    var brushAreaEvent = {};
                    if (brushAxis === constants_1.BrushAxis.X || brushAxis === constants_1.BrushAxis.Both) {
                        brushAreaEvent.x = getXBrushExtent(chartDimensions, lastDrag, rotation, histogramMode, xScale, smallMultipleScales, allowBrushingLastHistogramBin, seriesSpec, minBrushDelta, roundHistogramBrushValues);
                    }
                    if (brushAxis === constants_1.BrushAxis.Y || brushAxis === constants_1.BrushAxis.Both) {
                        brushAreaEvent.y = getYBrushExtents(chartDimensions, lastDrag, rotation, yScales, smallMultipleScales, minBrushDelta);
                    }
                    if (brushAreaEvent.x !== undefined || brushAreaEvent.y !== undefined) {
                        onBrushEnd(brushAreaEvent);
                    }
                }
                prevProps = nextProps;
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnBrushEndCaller = createOnBrushEndCaller;
function scalePanelPointsToPanelCoordinates(scaleXPoint, _a) {
    var start = _a.start, end = _a.end, vPanelStart = _a.vPanelStart, hPanelStart = _a.hPanelStart, vPanelHeight = _a.vPanelHeight, hPanelWidth = _a.hPanelWidth;
    var startPos = scaleXPoint ? start.x - hPanelStart : start.y - vPanelStart;
    var endPos = scaleXPoint ? end.x - hPanelStart : end.y - vPanelStart;
    var panelMax = scaleXPoint ? hPanelWidth : vPanelHeight;
    return {
        minPos: Math.min(startPos, endPos),
        maxPos: Math.max(startPos, endPos),
        panelMax: panelMax,
    };
}
function getXBrushExtent(chartDimensions, lastDrag, rotation, histogramMode, xScale, smallMultipleScales, allowBrushingLastHistogramBin, seriesSpecs, minBrushDelta, roundHistogramBrushValues) {
    var isXHorizontal = !(0, common_2.isVerticalRotation)(rotation);
    var scaledPanelPoints = getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, isXHorizontal);
    var minPos = scaledPanelPoints.minPos, maxPos = scaledPanelPoints.maxPos;
    if (rotation === -90 || rotation === 180) {
        minPos = scaledPanelPoints.panelMax - minPos;
        maxPos = scaledPanelPoints.panelMax - maxPos;
    }
    if (minBrushDelta !== undefined ? Math.abs(maxPos - minPos) < minBrushDelta : maxPos === minPos) {
        return;
    }
    var offset = histogramMode ? 0 : -(xScale.bandwidth + xScale.bandwidthPadding) / 2;
    var histogramEnabled = (0, y_domain_1.isHistogramEnabled)(seriesSpecs);
    var invertValue = histogramEnabled && roundHistogramBrushValues
        ? function (value) { return xScale.invertWithStep(value, xScale.domain).value; }
        : function (value) { return xScale.invert(value); };
    var minPosScaled = invertValue(minPos + offset);
    var maxPosScaled = invertValue(maxPos + offset);
    var maxDomainValue = xScale.domain[1] + (histogramEnabled && allowBrushingLastHistogramBin ? xScale.minInterval : 0);
    var minValue = (0, common_1.clamp)(minPosScaled, xScale.domain[0], maxPosScaled);
    var maxValue = (0, common_1.clamp)(minPosScaled, maxPosScaled, maxDomainValue);
    return [minValue, maxValue];
}
function getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, scaleXPoint) {
    var panelPoints = getPanelPoints(chartDimensions, lastDrag, smallMultipleScales);
    return scalePanelPointsToPanelCoordinates(scaleXPoint, panelPoints);
}
function getPanelPoints(chartDimensions, lastDrag, smallMultipleScales) {
    var plotStartPointPx = (0, get_brush_area_1.getPlotAreaRestrictedPoint)(lastDrag.start.position, chartDimensions);
    var plotEndPointPx = (0, get_brush_area_1.getPlotAreaRestrictedPoint)(lastDrag.end.position, chartDimensions);
    return (0, get_brush_area_1.getPointsConstraintToSinglePanel)(plotStartPointPx, plotEndPointPx, smallMultipleScales);
}
function getYBrushExtents(chartDimensions, lastDrag, rotation, yScales, smallMultipleScales, minBrushDelta) {
    var yValues = [];
    yScales.forEach(function (yScale, groupId) {
        var isXVertical = (0, common_2.isVerticalRotation)(rotation);
        var scaledPanelPoints = getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, isXVertical);
        var minPos = scaledPanelPoints.minPos, maxPos = scaledPanelPoints.maxPos;
        if (rotation === 90 || rotation === 180) {
            minPos = scaledPanelPoints.panelMax - minPos;
            maxPos = scaledPanelPoints.panelMax - maxPos;
        }
        if (minBrushDelta !== undefined ? Math.abs(maxPos - minPos) < minBrushDelta : maxPos === minPos) {
            return;
        }
        var minPosScaled = yScale.invert(minPos);
        var maxPosScaled = yScale.invert(maxPos);
        var minValue = (0, common_1.clamp)(minPosScaled, yScale.domain[0], maxPosScaled);
        var maxValue = (0, common_1.clamp)(minPosScaled, maxPosScaled, yScale.domain[1]);
        yValues.push({ extent: [minValue, maxValue], groupId: groupId });
    });
    return yValues.length === 0 ? undefined : yValues;
}
//# sourceMappingURL=on_brush_end_caller.js.map