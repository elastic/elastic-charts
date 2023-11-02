"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleRectangleAnnotations = void 0;
const compute_annotations_1 = require("./compute_annotations");
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_annotation_tooltip_state_1 = require("./get_annotation_tooltip_state");
const get_specs_1 = require("./get_specs");
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
const tooltip_1 = require("../../annotations/tooltip");
const specs_1 = require("../../utils/specs");
const getCurrentPointerPosition = (state) => state.interactions.pointer.current.position;
const getHoveredDOMElement = (state) => state.interactions.hoveredDOMElement;
exports.getMultipleRectangleAnnotations = (0, create_selector_1.createCustomCachedSelector)([
    getCurrentPointerPosition,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_chart_rotation_1.getChartRotationSelector,
    get_specs_1.getAnnotationSpecsSelector,
    compute_annotations_1.computeAnnotationDimensionsSelector,
    get_tooltip_values_highlighted_geoms_1.getTooltipInfoSelector,
    getHoveredDOMElement,
], getMultipleRectangularAnnotationTooltipState);
function getMultipleRectangularAnnotationTooltipState(cursorPosition, { chartDimensions, }, chartRotation, annotationSpecs, annotationDimensions, tooltip, hoveredDOMElement) {
    const hoveredTooltip = (0, get_annotation_tooltip_state_1.getTooltipStateForDOMElements)(chartDimensions, annotationSpecs, annotationDimensions, hoveredDOMElement);
    if (hoveredTooltip) {
        return [hoveredTooltip];
    }
    const tooltipState = (0, tooltip_1.computeMultipleRectAnnotationTooltipState)(cursorPosition, annotationDimensions, annotationSpecs, chartRotation, chartDimensions);
    const isChartTooltipDisplayed = tooltip.values.some(({ isHighlighted }) => isHighlighted);
    tooltipState === null || tooltipState === void 0 ? void 0 : tooltipState.forEach((rectAnnotation) => {
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