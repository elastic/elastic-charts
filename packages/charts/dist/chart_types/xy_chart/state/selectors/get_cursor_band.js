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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCursorBandPositionSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var common_1 = require("../../../../utils/common");
var events_1 = require("../../../../utils/events");
var crosshair_utils_1 = require("../../crosshair/crosshair_utils");
var common_2 = require("../utils/common");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_series_geometries_1 = require("./compute_series_geometries");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var count_bars_in_cluster_1 = require("./count_bars_in_cluster");
var get_geometries_index_keys_1 = require("./get_geometries_index_keys");
var get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
var get_specs_1 = require("./get_specs");
var is_tooltip_snap_enabled_1 = require("./is_tooltip_snap_enabled");
var getExternalPointerEventStateSelector = function (state) { return state.externalEvents.pointer; };
exports.getCursorBandPositionSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_oriented_projected_pointer_position_1.getOrientedProjectedPointerPositionSelector,
    getExternalPointerEventStateSelector,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    compute_series_geometries_1.computeSeriesGeometriesSelector,
    get_specs_1.getSeriesSpecsSelector,
    count_bars_in_cluster_1.countBarsInClusterSelector,
    is_tooltip_snap_enabled_1.isTooltipSnapEnableSelector,
    get_geometries_index_keys_1.getGeometriesIndexKeysSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
], getCursorBand);
function getCursorBand(orientedProjectedPointerPosition, externalPointerEvent, _a, settingsSpec, _b, seriesSpecs, totalBarsInCluster, isTooltipSnapEnabled, geometriesIndexKeys, smallMultipleScales) {
    var chartDimensions = _a.chartDimensions;
    var xScale = _b.scales.xScale;
    if (!xScale) {
        return;
    }
    var isLineAreaOnly = (0, common_2.isLineAreaOnlyChart)(seriesSpecs);
    var pointerPosition = __assign({}, orientedProjectedPointerPosition);
    var xValue;
    var fromExternalEvent = false;
    if ((0, events_1.isValidPointerOverEvent)(xScale, externalPointerEvent)) {
        fromExternalEvent = true;
        if ((0, common_1.isNil)(externalPointerEvent.x)) {
            return;
        }
        var x = xScale.pureScale(externalPointerEvent.x);
        if (Number.isNaN(x) || x > chartDimensions.width || x < 0) {
            return;
        }
        pointerPosition = {
            x: x,
            y: 0,
            verticalPanelValue: null,
            horizontalPanelValue: null,
        };
        xValue = externalPointerEvent.x;
    }
    else {
        xValue = xScale.invertWithStep(orientedProjectedPointerPosition.x, geometriesIndexKeys).value;
        if ((0, common_1.isNil)(xValue) || Number.isNaN(xValue)) {
            return;
        }
    }
    var horizontal = smallMultipleScales.horizontal, vertical = smallMultipleScales.vertical;
    var topPos = (!(0, common_1.isNil)(pointerPosition.verticalPanelValue) && vertical.scale(pointerPosition.verticalPanelValue)) || 0;
    var leftPos = (!(0, common_1.isNil)(pointerPosition.horizontalPanelValue) && horizontal.scale(pointerPosition.horizontalPanelValue)) || 0;
    var panel = {
        width: horizontal.bandwidth,
        height: vertical.bandwidth,
        top: chartDimensions.top + topPos,
        left: chartDimensions.left + leftPos,
    };
    var cursorBand = (0, crosshair_utils_1.getCursorBandPosition)(settingsSpec.rotation, panel, pointerPosition, {
        value: xValue,
        withinBandwidth: true,
    }, isTooltipSnapEnabled, xScale, isLineAreaOnly ? 0 : totalBarsInCluster);
    return cursorBand && __assign(__assign({}, cursorBand), { fromExternalEvent: fromExternalEvent });
}
//# sourceMappingURL=get_cursor_band.js.map