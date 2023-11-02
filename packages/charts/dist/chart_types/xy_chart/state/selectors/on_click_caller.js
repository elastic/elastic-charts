"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnClickCaller = void 0;
const get_multiple_rectangle_annotations_1 = require("./get_multiple_rectangle_annotations");
const get_projected_scaled_values_1 = require("./get_projected_scaled_values");
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const __1 = require("../../..");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_last_click_1 = require("../../../../state/selectors/get_last_click");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const utils_1 = require("../../../../state/utils");
function createOnClickCaller() {
    let prevClick = null;
    let selector = null;
    return (state) => {
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
        ], (lastClick, { onElementClick, onProjectionClick, onAnnotationClick }, indexedGeometries, values, tooltipStates) => {
            if (!(0, utils_1.isClicking)(prevClick, lastClick)) {
                return;
            }
            const elementClickFired = tryFiringOnElementClick(indexedGeometries, onElementClick);
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
    const elements = indexedGeometries.map(({ value, seriesIdentifier }) => [
        value,
        seriesIdentifier,
    ]);
    onElementClick(elements);
    return true;
}
function tryFiringOnProjectionClick(values, onProjectionClick) {
    const properClick = values !== undefined && onProjectionClick;
    if (properClick)
        onProjectionClick(values);
    return Boolean(properClick);
}
function tryFiringOnAnnotationClick(annotationState, onAnnotationClick, indexedGeometries) {
    if (indexedGeometries.length > 0)
        return false;
    if (annotationState.length > 0 && onAnnotationClick) {
        const rects = [];
        const lines = [];
        annotationState.forEach((annotation) => {
            if (annotation.annotationType === specs_1.AnnotationType.Rectangle) {
                rects.push({
                    id: annotation.id,
                    datum: annotation.datum,
                });
            }
            else if (annotation.annotationType === specs_1.AnnotationType.Line) {
                lines.push({
                    id: annotation.id,
                    datum: annotation.datum,
                });
            }
        });
        onAnnotationClick({ rects, lines });
        return true;
    }
    return false;
}
//# sourceMappingURL=on_click_caller.js.map