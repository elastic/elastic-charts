"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipAnchorPositionSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
var common_1 = require("../../../../utils/common");
var crosshair_utils_1 = require("../../crosshair/crosshair_utils");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var get_cursor_band_1 = require("./get_cursor_band");
var get_projected_pointer_position_1 = require("./get_projected_pointer_position");
exports.getTooltipAnchorPositionSelector = (0, create_selector_1.createCustomCachedSelector)([
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    get_cursor_band_1.getCursorBandPositionSelector,
    get_projected_pointer_position_1.getProjectedPointerPositionSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    get_tooltip_spec_1.getTooltipSpecSelector,
], function (chartDimensions, settings, cursorBandPosition, projectedPointerPosition, _a, tooltip) {
    var horizontal = _a.horizontal, vertical = _a.vertical;
    if (!cursorBandPosition) {
        return null;
    }
    var topPos = (!(0, common_1.isNil)(projectedPointerPosition.verticalPanelValue) &&
        vertical.scale(projectedPointerPosition.verticalPanelValue)) ||
        0;
    var leftPos = (!(0, common_1.isNil)(projectedPointerPosition.horizontalPanelValue) &&
        horizontal.scale(projectedPointerPosition.horizontalPanelValue)) ||
        0;
    var panel = {
        width: horizontal.bandwidth,
        height: vertical.bandwidth,
        top: chartDimensions.chartDimensions.top + topPos,
        left: chartDimensions.chartDimensions.left + leftPos,
    };
    return (0, crosshair_utils_1.getTooltipAnchorPosition)(settings.rotation, cursorBandPosition, projectedPointerPosition, panel, tooltip.stickTo);
});
//# sourceMappingURL=get_tooltip_anchor_position.js.map