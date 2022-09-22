"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointerCursorSelector = void 0;
var constants_1 = require("../../../../common/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var get_annotation_tooltip_state_1 = require("./get_annotation_tooltip_state");
var get_projected_scaled_values_1 = require("./get_projected_scaled_values");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
var is_brush_available_1 = require("./is_brush_available");
var getCurrentPointerPositionSelector = function (state) { return state.interactions.pointer.current.position; };
var getTooltipInteractionStateSelector = function (state) { return state.interactions.tooltip; };
exports.getPointerCursorSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_tooltip_values_highlighted_geoms_1.getHighlightedGeomsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    getCurrentPointerPositionSelector,
    get_projected_scaled_values_1.getProjectedScaledValues,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    is_brush_available_1.isBrushAvailableSelector,
    get_annotation_tooltip_state_1.getAnnotationTooltipStateSelector,
    getTooltipInteractionStateSelector,
], function (highlightedGeometries, settingsSpec, currentPointerPosition, projectedValues, _a, isBrushAvailable, annotationTooltipState, tooltipState) {
    var chartDimensions = _a.chartDimensions;
    if (tooltipState.pinned)
        return;
    var x = currentPointerPosition.x, y = currentPointerPosition.y;
    var xPos = x - chartDimensions.left;
    var yPos = y - chartDimensions.top;
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