"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAnnotations = void 0;
var merge_utils_1 = require("../../../../../utils/themes/merge_utils");
var spec_1 = require("../../../state/utils/spec");
var specs_1 = require("../../../utils/specs");
var utils_1 = require("../../common/utils");
var lines_1 = require("./lines");
var rect_1 = require("./rect");
function renderAnnotations(ctx, aCtx, annotationDimensions, annotationSpecs, rotation, renderingArea, sharedStyle, hoveredAnnotationIds, renderOnBackground) {
    if (renderOnBackground === void 0) { renderOnBackground = true; }
    annotationDimensions.forEach(function (annotation, id) {
        var _a;
        var spec = (0, spec_1.getSpecsById)(annotationSpecs, id);
        var isBackground = ((_a = spec === null || spec === void 0 ? void 0 : spec.zIndex) !== null && _a !== void 0 ? _a : 0) <= 0;
        if (spec && isBackground === renderOnBackground) {
            var getHoverParams = (0, utils_1.getAnnotationHoverParamsFn)(hoveredAnnotationIds, sharedStyle, spec.animations);
            if ((0, specs_1.isLineAnnotation)(spec)) {
                var lineStyle = (0, merge_utils_1.mergeWithDefaultAnnotationLine)(spec.style);
                (0, lines_1.renderLineAnnotations)(ctx, aCtx, annotation, lineStyle, getHoverParams, rotation, renderingArea);
            }
            else if ((0, specs_1.isRectAnnotation)(spec)) {
                var rectStyle = (0, merge_utils_1.mergeWithDefaultAnnotationRect)(spec.style);
                (0, rect_1.renderRectAnnotations)(ctx, aCtx, annotation, rectStyle, getHoverParams, rotation, renderingArea);
            }
        }
    });
}
exports.renderAnnotations = renderAnnotations;
//# sourceMappingURL=index.js.map