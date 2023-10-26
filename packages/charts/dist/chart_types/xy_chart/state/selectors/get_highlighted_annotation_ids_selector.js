"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedAnnotationIdsSelector = void 0;
const get_multiple_rectangle_annotations_1 = require("./get_multiple_rectangle_annotations");
const get_specs_1 = require("./get_specs");
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const dom_element_1 = require("../../../../state/actions/dom_element");
const create_selector_1 = require("../../../../state/create_selector");
const specs_1 = require("../../utils/specs");
const getHoveredDOMElement = (state) => state.interactions.hoveredDOMElement;
exports.getHighlightedAnnotationIdsSelector = (0, create_selector_1.createCustomCachedSelector)([getHoveredDOMElement, get_multiple_rectangle_annotations_1.getMultipleRectangleAnnotations, get_specs_1.getAnnotationSpecsSelector, get_tooltip_values_highlighted_geoms_1.getHighlightedGeomsSelector], (hoveredDOMElement, rectAnnotationTooltips, specs, highlightedGeoms) => {
    if (highlightedGeoms.length > 0)
        return [];
    const ids = (rectAnnotationTooltips !== null && rectAnnotationTooltips !== void 0 ? rectAnnotationTooltips : [])
        .filter(({ annotationType, isVisible }) => isVisible && annotationType === specs_1.AnnotationType.Rectangle)
        .map(({ id }) => id);
    if ((hoveredDOMElement === null || hoveredDOMElement === void 0 ? void 0 : hoveredDOMElement.type) === dom_element_1.DOMElementType.LineAnnotationMarker && (hoveredDOMElement === null || hoveredDOMElement === void 0 ? void 0 : hoveredDOMElement.id)) {
        ids.push(hoveredDOMElement.id);
    }
    return ids;
});
//# sourceMappingURL=get_highlighted_annotation_ids_selector.js.map