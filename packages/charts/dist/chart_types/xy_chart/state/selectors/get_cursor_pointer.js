"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointerCursorSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_annotation_tooltip_state_1 = require("./get_annotation_tooltip_state");
const get_projected_scaled_values_1 = require("./get_projected_scaled_values");
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const is_brush_available_1 = require("./is_brush_available");
const constants_1 = require("../../../../common/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const is_brushing_1 = require("../../../../state/selectors/is_brushing");
const getCurrentPointerPositionSelector = (state) => state.interactions.pointer.current.position;
const getTooltipInteractionStateSelector = (state) => state.interactions.tooltip;
exports.getPointerCursorSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_tooltip_values_highlighted_geoms_1.getHighlightedGeomsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    getCurrentPointerPositionSelector,
    get_projected_scaled_values_1.getProjectedScaledValues,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    is_brush_available_1.isBrushAvailableSelector,
    get_annotation_tooltip_state_1.getAnnotationTooltipStateSelector,
    getTooltipInteractionStateSelector,
    is_brushing_1.isBrushingSelector,
], (highlightedGeometries, settingsSpec, currentPointerPosition, projectedValues, { chartDimensions }, isBrushAvailable, annotationTooltipState, tooltipState, isBrushing) => {
    if (tooltipState.pinned)
        return;
    if (isBrushAvailable && isBrushing)
        return 'crosshair';
    const { x, y } = currentPointerPosition;
    const xPos = x - chartDimensions.left;
    const yPos = y - chartDimensions.top;
    if (xPos < 0 || xPos >= chartDimensions.width || yPos < 0 || yPos >= chartDimensions.height) {
        return constants_1.DEFAULT_CSS_CURSOR;
    }
    if (highlightedGeometries.length > 0 && settingsSpec.onElementClick) {
        return 'pointer';
    }
    if (highlightedGeometries.length === 0 && settingsSpec.onAnnotationClick && annotationTooltipState) {
        return 'pointer';
    }
    if (projectedValues !== null && settingsSpec.onProjectionClick) {
        return 'pointer';
    }
    return isBrushAvailable ? 'crosshair' : constants_1.DEFAULT_CSS_CURSOR;
});
//# sourceMappingURL=get_cursor_pointer.js.map