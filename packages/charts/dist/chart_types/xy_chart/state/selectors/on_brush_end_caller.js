"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnBrushEndCaller = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_brush_area_1 = require("./get_brush_area");
const get_computed_scales_1 = require("./get_computed_scales");
const get_specs_1 = require("./get_specs");
const is_brush_available_1 = require("./is_brush_available");
const is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
const __1 = require("../../..");
const types_1 = require("../../../../scales/types");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const common_1 = require("../../../../utils/common");
const events_1 = require("../../../../utils/events");
const y_domain_1 = require("../../domains/y_domain");
const common_2 = require("../utils/common");
const getLastDragSelector = (state) => state.interactions.pointer.lastDrag;
function createOnBrushEndCaller() {
    let prevProps = null;
    let selector = null;
    return (state) => {
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
            ], (lastDrag, { onBrushEnd, rotation, brushAxis, minBrushDelta, roundHistogramBrushValues, allowBrushingLastHistogramBin }, computedScales, { chartDimensions }, histogramMode, smallMultipleScales, seriesSpec) => {
                const nextProps = {
                    lastDrag,
                    onBrushEnd,
                };
                const { yScales, xScale } = computedScales;
                if (lastDrag !== null && (0, events_1.hasDragged)(prevProps, nextProps) && onBrushEnd && (0, types_1.isContinuousScale)(xScale)) {
                    const brushAreaEvent = {};
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
function scalePanelPointsToPanelCoordinates(scaleXPoint, { start, end, vPanelStart, hPanelStart, vPanelHeight, hPanelWidth }) {
    const startPos = scaleXPoint ? start.x - hPanelStart : start.y - vPanelStart;
    const endPos = scaleXPoint ? end.x - hPanelStart : end.y - vPanelStart;
    const panelMax = scaleXPoint ? hPanelWidth : vPanelHeight;
    return {
        minPos: Math.min(startPos, endPos),
        maxPos: Math.max(startPos, endPos),
        panelMax,
    };
}
function getXBrushExtent(chartDimensions, lastDrag, rotation, histogramMode, xScale, smallMultipleScales, allowBrushingLastHistogramBin, seriesSpecs, minBrushDelta, roundHistogramBrushValues) {
    const isXHorizontal = !(0, common_2.isVerticalRotation)(rotation);
    const scaledPanelPoints = getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, isXHorizontal);
    let { minPos, maxPos } = scaledPanelPoints;
    if (rotation === -90 || rotation === 180) {
        minPos = scaledPanelPoints.panelMax - minPos;
        maxPos = scaledPanelPoints.panelMax - maxPos;
    }
    if (minBrushDelta !== undefined ? Math.abs(maxPos - minPos) < minBrushDelta : maxPos === minPos) {
        return;
    }
    const offset = histogramMode ? 0 : -(xScale.bandwidth + xScale.bandwidthPadding) / 2;
    const histogramEnabled = (0, y_domain_1.isHistogramEnabled)(seriesSpecs);
    const invertValue = histogramEnabled && roundHistogramBrushValues
        ? (value) => xScale.invertWithStep(value, xScale.domain).value
        : (value) => xScale.invert(value);
    const minPosScaled = invertValue(minPos + offset);
    const maxPosScaled = invertValue(maxPos + offset);
    const [domainStart, domainEnd] = xScale.domain;
    const maxDomainValue = domainEnd + (histogramEnabled && allowBrushingLastHistogramBin ? xScale.minInterval : 0);
    const minValue = (0, common_1.clamp)(minPosScaled, domainStart, maxPosScaled);
    const maxValue = (0, common_1.clamp)(minPosScaled, maxPosScaled, maxDomainValue);
    return [minValue, maxValue];
}
function getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, scaleXPoint) {
    const panelPoints = getPanelPoints(chartDimensions, lastDrag, smallMultipleScales);
    return scalePanelPointsToPanelCoordinates(scaleXPoint, panelPoints);
}
function getPanelPoints(chartDimensions, lastDrag, smallMultipleScales) {
    const plotStartPointPx = (0, get_brush_area_1.getPlotAreaRestrictedPoint)(lastDrag.start.position, chartDimensions);
    const plotEndPointPx = (0, get_brush_area_1.getPlotAreaRestrictedPoint)(lastDrag.end.position, chartDimensions);
    return (0, get_brush_area_1.getPointsConstraintToSinglePanel)(plotStartPointPx, plotEndPointPx, smallMultipleScales);
}
function getYBrushExtents(chartDimensions, lastDrag, rotation, yScales, smallMultipleScales, minBrushDelta) {
    const yValues = [];
    yScales.forEach((yScale, groupId) => {
        const isXVertical = (0, common_2.isVerticalRotation)(rotation);
        const scaledPanelPoints = getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, isXVertical);
        let { minPos, maxPos } = scaledPanelPoints;
        if (rotation === 90 || rotation === 180) {
            minPos = scaledPanelPoints.panelMax - minPos;
            maxPos = scaledPanelPoints.panelMax - maxPos;
        }
        if (minBrushDelta !== undefined ? Math.abs(maxPos - minPos) < minBrushDelta : maxPos === minPos) {
            return;
        }
        const minPosScaled = yScale.invert(minPos);
        const maxPosScaled = yScale.invert(maxPos);
        const [domainStart, domainEnd] = yScale.domain;
        const minValue = (0, common_1.clamp)(minPosScaled, domainStart, maxPosScaled);
        const maxValue = (0, common_1.clamp)(minPosScaled, maxPosScaled, domainEnd);
        yValues.push({ extent: [minValue, maxValue], groupId });
    });
    return yValues.length === 0 ? undefined : yValues;
}
//# sourceMappingURL=on_brush_end_caller.js.map