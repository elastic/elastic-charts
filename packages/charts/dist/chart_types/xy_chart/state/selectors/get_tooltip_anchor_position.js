"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipAnchorPositionSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_cursor_band_1 = require("./get_cursor_band");
const get_projected_pointer_position_1 = require("./get_projected_pointer_position");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
const common_1 = require("../../../../utils/common");
const crosshair_utils_1 = require("../../crosshair/crosshair_utils");
exports.getTooltipAnchorPositionSelector = (0, create_selector_1.createCustomCachedSelector)([
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    get_cursor_band_1.getCursorBandPositionSelector,
    get_projected_pointer_position_1.getProjectedPointerPositionSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    get_tooltip_spec_1.getTooltipSpecSelector,
], (chartDimensions, settings, cursorBandPosition, projectedPointerPosition, { horizontal, vertical }, tooltip) => {
    if (!cursorBandPosition) {
        return null;
    }
    const topPos = (!(0, common_1.isNil)(projectedPointerPosition.verticalPanelValue) &&
        vertical.scale(projectedPointerPosition.verticalPanelValue)) ||
        0;
    const leftPos = (!(0, common_1.isNil)(projectedPointerPosition.horizontalPanelValue) &&
        horizontal.scale(projectedPointerPosition.horizontalPanelValue)) ||
        0;
    const panel = {
        width: horizontal.bandwidth,
        height: vertical.bandwidth,
        top: chartDimensions.chartDimensions.top + topPos,
        left: chartDimensions.chartDimensions.left + leftPos,
    };
    return (0, crosshair_utils_1.getTooltipAnchorPosition)(settings.rotation, cursorBandPosition, projectedPointerPosition, panel, tooltip.stickTo);
});
//# sourceMappingURL=get_tooltip_anchor_position.js.map