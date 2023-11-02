"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMultipleRectAnnotationTooltipState = exports.computeRectAnnotationTooltipState = void 0;
const tooltip_1 = require("./rect/tooltip");
const specs_1 = require("../utils/specs");
function computeRectAnnotationTooltipState(cursorPosition, annotationDimensions, annotationSpecs, chartRotation, chartDimensions) {
    const sortedAnnotationSpecs = annotationSpecs
        .filter(specs_1.isRectAnnotation)
        .sort(({ zIndex: a = Number.MIN_SAFE_INTEGER }, { zIndex: b = Number.MIN_SAFE_INTEGER }) => a - b);
    for (let i = 0; i < sortedAnnotationSpecs.length; i++) {
        const spec = sortedAnnotationSpecs[i];
        const annotationDimension = (spec === null || spec === void 0 ? void 0 : spec.id) && annotationDimensions.get(spec.id);
        if (!spec || spec.hideTooltips || !annotationDimension) {
            continue;
        }
        const { customTooltip, customTooltipDetails } = spec;
        const tooltipSettings = getTooltipSettings(spec);
        const rectAnnotationTooltipState = (0, tooltip_1.getRectAnnotationTooltipState)(cursorPosition, annotationDimension, chartRotation, chartDimensions, spec.id);
        if (rectAnnotationTooltipState) {
            return {
                ...rectAnnotationTooltipState,
                tooltipSettings,
                customTooltip,
                customTooltipDetails,
            };
        }
    }
    return null;
}
exports.computeRectAnnotationTooltipState = computeRectAnnotationTooltipState;
function computeMultipleRectAnnotationTooltipState(cursorPosition, annotationDimensions, annotationSpecs, chartRotation, chartDimensions) {
    const sortedAnnotationSpecs = annotationSpecs
        .filter(specs_1.isRectAnnotation)
        .sort(({ zIndex: a = Number.MIN_SAFE_INTEGER }, { zIndex: b = Number.MIN_SAFE_INTEGER }) => a - b);
    return sortedAnnotationSpecs.reduce((acc, spec) => {
        const annotationDimension = annotationDimensions.get(spec.id);
        if (!spec.hideTooltips && annotationDimension) {
            const { customTooltip, customTooltipDetails } = spec;
            const tooltipSettings = getTooltipSettings(spec);
            const rectAnnotationTooltipState = (0, tooltip_1.getRectAnnotationTooltipState)(cursorPosition, annotationDimension, chartRotation, chartDimensions, spec.id);
            if (rectAnnotationTooltipState) {
                acc.push({
                    ...rectAnnotationTooltipState,
                    tooltipSettings,
                    customTooltip,
                    customTooltipDetails,
                });
            }
        }
        return acc;
    }, []);
}
exports.computeMultipleRectAnnotationTooltipState = computeMultipleRectAnnotationTooltipState;
function getTooltipSettings({ placement, fallbackPlacements, boundary, offset, }) {
    return {
        placement,
        fallbackPlacements,
        boundary,
        offset,
    };
}
//# sourceMappingURL=tooltip.js.map