"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleRectangleAnnotations = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
var tooltip_1 = require("../../annotations/tooltip");
var specs_1 = require("../../utils/specs");
var compute_annotations_1 = require("./compute_annotations");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var get_annotation_tooltip_state_1 = require("./get_annotation_tooltip_state");
var get_specs_1 = require("./get_specs");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
var getCurrentPointerPosition = function (state) { return state.interactions.pointer.current.position; };
var getHoveredDOMElement = function (state) { return state.interactions.hoveredDOMElement; };
exports.getMultipleRectangleAnnotations = (0, create_selector_1.createCustomCachedSelector)([
    getCurrentPointerPosition,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_chart_rotation_1.getChartRotationSelector,
    get_specs_1.getAnnotationSpecsSelector,
    compute_annotations_1.computeAnnotationDimensionsSelector,
    get_tooltip_values_highlighted_geoms_1.getTooltipInfoSelector,
    getHoveredDOMElement,
], getMultipleRectangularAnnotationTooltipState);
function getMultipleRectangularAnnotationTooltipState(cursorPosition, _a, chartRotation, annotationSpecs, annotationDimensions, tooltip, hoveredDOMElement) {
    var chartDimensions = _a.chartDimensions;
    var hoveredTooltip = (0, get_annotation_tooltip_state_1.getTooltipStateForDOMElements)(chartDimensions, annotationSpecs, annotationDimensions, hoveredDOMElement);
    if (hoveredTooltip) {
        return [hoveredTooltip];
    }
    var tooltipState = (0, tooltip_1.computeMultipleRectAnnotationTooltipState)(cursorPosition, annotationDimensions, annotationSpecs, chartRotation, chartDimensions);
    var isChartTooltipDisplayed = tooltip.values.some(function (_a) {
        var isHighlighted = _a.isHighlighted;
        return isHighlighted;
    });
    tooltipState === null || tooltipState === void 0 ? void 0 : tooltipState.forEach(function (rectAnnotation) {
        if (tooltipState &&
            rectAnnotation.isVisible &&
            rectAnnotation.annotationType === specs_1.AnnotationType.Rectangle &&
            isChartTooltipDisplayed) {
            return null;
        }
    });
    return tooltipState;
}
//# sourceMappingURL=get_multiple_rectangle_annotations.js.map