"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipAnchorSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const picked_shapes_1 = require("./picked_shapes");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
exports.getTooltipAnchorSelector = (0, create_selector_1.createCustomCachedSelector)([
    picked_shapes_1.getPickedShapes,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_active_pointer_position_1.getActivePointerPosition,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    get_chart_theme_1.getChartThemeSelector,
], (shapes, { chartDimensions }, position, smScales, { heatmap }) => {
    const shape = Array.isArray(shapes) && shapes[0];
    if (shape) {
        const { x, y, width, height, datum: { smHorizontalAccessorValue = '', smVerticalAccessorValue = '' }, } = shape;
        const scaledPanelXOffset = smScales.horizontal.scale(smHorizontalAccessorValue);
        const scaledPanelYOffset = smScales.vertical.scale(smVerticalAccessorValue);
        const panelXOffset = isNaN(scaledPanelXOffset) ? 0 : scaledPanelXOffset;
        const panelYOffset = isNaN(scaledPanelYOffset) ? 0 : scaledPanelYOffset;
        return {
            x: x + chartDimensions.left + panelXOffset,
            width,
            y: y - chartDimensions.top + panelYOffset + heatmap.grid.stroke.width,
            height,
        };
    }
    return {
        x: position.x,
        width: 0,
        y: position.y,
        height: 0,
    };
});
//# sourceMappingURL=get_tooltip_anchor.js.map