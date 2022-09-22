"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnClickCaller = void 0;
var __1 = require("../../..");
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var get_last_click_1 = require("../../../../state/selectors/get_last_click");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var utils_1 = require("../../../../state/utils");
var get_multiple_rectangle_annotations_1 = require("./get_multiple_rectangle_annotations");
var get_projected_scaled_values_1 = require("./get_projected_scaled_values");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
function createOnClickCaller() {
    var prevClick = null;
    var selector = null;
    return function (state) {
        if (selector) {
            return selector(state);
        }
        if (state.chartType !== __1.ChartType.XYAxis) {
            return;
        }
        selector = (0, create_selector_1.createCustomCachedSelector)([
            get_last_click_1.getLastClickSelector,
            get_settings_spec_1.getSettingsSpecSelector,
            get_tooltip_values_highlighted_geoms_1.getHighlightedGeomsSelector,
            get_projected_scaled_values_1.getProjectedScaledValues,
            get_multiple_rectangle_annotations_1.getMultipleRectangleAnnotations,
        ], function (lastClick, _a, indexedGeometries, values, tooltipStates) {
            var onElementClick = _a.onElementClick, onProjectionClick = _a.onProjectionClick, onAnnotationClick = _a.onAnnotationClick;
            if (!(0, utils_1.isClicking)(prevClick, lastClick)) {
                return;
            }
            var elementClickFired = tryFiringOnElementClick(indexedGeometries, onElementClick);
            if (!elementClickFired && onAnnotationClick && tooltipStates) {
                tryFiringOnAnnotationClick(tooltipStates, onAnnotationClick, indexedGeometries);
            }
            else if (!elementClickFired) {
                tryFiringOnProjectionClick(values, onProjectionClick);
            }
            prevClick = lastClick;
        });
    };
}
exports.createOnClickCaller = createOnClickCaller;
function tryFiringOnElementClick(indexedGeometries, onElementClick) {
    if (indexedGeometries.length === 0 || !onElementClick) {
        return false;
    }
    var elements = indexedGeometries.map(function (_a) {
        var value = _a.value, seriesIdentifier = _a.seriesIdentifier;
        return [
            value,
            seriesIdentifier,
        ];
    });
    onElementClick(elements);
    return true;
}
function tryFiringOnProjectionClick(values, onProjectionClick) {
    var properClick = values !== undefined && onProjectionClick;
    if (properClick)
        onProjectionClick(values);
    return Boolean(properClick);
}
function tryFiringOnAnnotationClick(annotationState, onAnnotationClick, indexedGeometries) {
    if (indexedGeometries.length > 0)
        return false;
    if (annotationState.length > 0 && onAnnotationClick) {
        var rects_1 = [];
        var lines_1 = [];
        annotationState.forEach(function (annotation) {
            if (annotation.annotationType === specs_1.AnnotationType.Rectangle) {
                rects_1.push({
                    id: annotation.id,
                    datum: annotation.datum,
                });
            }
            else if (annotation.annotationType === specs_1.AnnotationType.Line) {
                lines_1.push({
                    id: annotation.id,
                    datum: annotation.datum,
                });
            }
        });
        onAnnotationClick({ rects: rects_1, lines: lines_1 });
        return true;
    }
    return false;
}
//# sourceMappingURL=on_click_caller.js.map