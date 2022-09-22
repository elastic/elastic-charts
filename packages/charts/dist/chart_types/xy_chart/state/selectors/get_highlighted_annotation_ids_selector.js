"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedAnnotationIdsSelector = void 0;
var dom_element_1 = require("../../../../state/actions/dom_element");
var create_selector_1 = require("../../../../state/create_selector");
var specs_1 = require("../../utils/specs");
var get_multiple_rectangle_annotations_1 = require("./get_multiple_rectangle_annotations");
var get_specs_1 = require("./get_specs");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
var getHoveredDOMElement = function (state) { return state.interactions.hoveredDOMElement; };
exports.getHighlightedAnnotationIdsSelector = (0, create_selector_1.createCustomCachedSelector)([getHoveredDOMElement, get_multiple_rectangle_annotations_1.getMultipleRectangleAnnotations, get_specs_1.getAnnotationSpecsSelector, get_tooltip_values_highlighted_geoms_1.getHighlightedGeomsSelector], function (hoveredDOMElement, rectAnnotationTooltips, specs, highlightedGeoms) {
    if (highlightedGeoms.length > 0)
        return [];
    var ids = (rectAnnotationTooltips !== null && rectAnnotationTooltips !== void 0 ? rectAnnotationTooltips : [])
        .filter(function (_a) {
        var annotationType = _a.annotationType, isVisible = _a.isVisible;
        return isVisible && annotationType === specs_1.AnnotationType.Rectangle;
    })
        .map(function (_a) {
        var id = _a.id;
        return id;
    });
    if ((hoveredDOMElement === null || hoveredDOMElement === void 0 ? void 0 : hoveredDOMElement.type) === dom_element_1.DOMElementType.LineAnnotationMarker && (hoveredDOMElement === null || hoveredDOMElement === void 0 ? void 0 : hoveredDOMElement.id)) {
        ids.push(hoveredDOMElement.id);
    }
    return ids;
});
//# sourceMappingURL=get_highlighted_annotation_ids_selector.js.map