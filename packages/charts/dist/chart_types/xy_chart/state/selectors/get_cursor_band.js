"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCursorBandPositionSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const compute_series_geometries_1 = require("./compute_series_geometries");
const count_bars_in_cluster_1 = require("./count_bars_in_cluster");
const get_geometries_index_keys_1 = require("./get_geometries_index_keys");
const get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
const get_specs_1 = require("./get_specs");
const is_tooltip_snap_enabled_1 = require("./is_tooltip_snap_enabled");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const common_1 = require("../../../../utils/common");
const events_1 = require("../../../../utils/events");
const crosshair_utils_1 = require("../../crosshair/crosshair_utils");
const common_2 = require("../utils/common");
const getExternalPointerEventStateSelector = (state) => state.externalEvents.pointer;
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
function getCursorBand(orientedProjectedPointerPosition, externalPointerEvent, { chartDimensions }, settingsSpec, { scales: { xScale } }, seriesSpecs, totalBarsInCluster, isTooltipSnapEnabled, geometriesIndexKeys, smallMultipleScales) {
    if (!xScale) {
        return;
    }
    const isLineAreaOnly = (0, common_2.isLineAreaOnlyChart)(seriesSpecs);
    let pointerPosition = { ...orientedProjectedPointerPosition };
    let xValue;
    let fromExternalEvent = false;
    if ((0, events_1.isValidPointerOverEvent)(xScale, externalPointerEvent)) {
        fromExternalEvent = true;
        if ((0, common_1.isNil)(externalPointerEvent.x)) {
            return;
        }
        const x = xScale.pureScale(externalPointerEvent.x);
        if (Number.isNaN(x) || x > chartDimensions.width || x < 0) {
            return;
        }
        pointerPosition = {
            x,
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
    const { horizontal, vertical } = smallMultipleScales;
    const topPos = (!(0, common_1.isNil)(pointerPosition.verticalPanelValue) && vertical.scale(pointerPosition.verticalPanelValue)) || 0;
    const leftPos = (!(0, common_1.isNil)(pointerPosition.horizontalPanelValue) && horizontal.scale(pointerPosition.horizontalPanelValue)) || 0;
    const panel = {
        width: horizontal.bandwidth,
        height: vertical.bandwidth,
        top: chartDimensions.top + topPos,
        left: chartDimensions.left + leftPos,
    };
    const cursorBand = (0, crosshair_utils_1.getCursorBandPosition)(settingsSpec.rotation, panel, pointerPosition, {
        value: xValue,
        withinBandwidth: true,
    }, isTooltipSnapEnabled, xScale, isLineAreaOnly ? 0 : totalBarsInCluster);
    return cursorBand && { ...cursorBand, fromExternalEvent };
}
//# sourceMappingURL=get_cursor_band.js.map