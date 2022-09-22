"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMultipleRectAnnotationTooltipState = exports.computeRectAnnotationTooltipState = void 0;
var specs_1 = require("../utils/specs");
var tooltip_1 = require("./rect/tooltip");
function computeRectAnnotationTooltipState(cursorPosition, annotationDimensions, annotationSpecs, chartRotation, chartDimensions) {
    var sortedAnnotationSpecs = annotationSpecs
        .filter(specs_1.isRectAnnotation)
        .sort(function (_a, _b) {
        var _c = _a.zIndex, a = _c === void 0 ? Number.MIN_SAFE_INTEGER : _c;
        var _d = _b.zIndex, b = _d === void 0 ? Number.MIN_SAFE_INTEGER : _d;
        return a - b;
    });
    for (var i = 0; i < sortedAnnotationSpecs.length; i++) {
        var spec = sortedAnnotationSpecs[i];
        var annotationDimension = annotationDimensions.get(spec.id);
        if (spec.hideTooltips || !annotationDimension) {
            continue;
        }
        var customTooltip = spec.customTooltip, customTooltipDetails = spec.customTooltipDetails;
        var tooltipSettings = getTooltipSettings(spec);
        var rectAnnotationTooltipState = (0, tooltip_1.getRectAnnotationTooltipState)(cursorPosition, annotationDimension, chartRotation, chartDimensions, spec.id);
        if (rectAnnotationTooltipState) {
            return __assign(__assign({}, rectAnnotationTooltipState), { tooltipSettings: tooltipSettings, customTooltip: customTooltip, customTooltipDetails: customTooltipDetails !== null && customTooltipDetails !== void 0 ? customTooltipDetails : spec.renderTooltip });
        }
    }
    return null;
}
exports.computeRectAnnotationTooltipState = computeRectAnnotationTooltipState;
function computeMultipleRectAnnotationTooltipState(cursorPosition, annotationDimensions, annotationSpecs, chartRotation, chartDimensions) {
    var sortedAnnotationSpecs = annotationSpecs
        .filter(specs_1.isRectAnnotation)
        .sort(function (_a, _b) {
        var _c = _a.zIndex, a = _c === void 0 ? Number.MIN_SAFE_INTEGER : _c;
        var _d = _b.zIndex, b = _d === void 0 ? Number.MIN_SAFE_INTEGER : _d;
        return a - b;
    });
    return sortedAnnotationSpecs.reduce(function (acc, spec) {
        var annotationDimension = annotationDimensions.get(spec.id);
        if (!spec.hideTooltips && annotationDimension) {
            var customTooltip = spec.customTooltip, customTooltipDetails = spec.customTooltipDetails;
            var tooltipSettings = getTooltipSettings(spec);
            var rectAnnotationTooltipState = (0, tooltip_1.getRectAnnotationTooltipState)(cursorPosition, annotationDimension, chartRotation, chartDimensions, spec.id);
            if (rectAnnotationTooltipState) {
                acc.push(__assign(__assign({}, rectAnnotationTooltipState), { tooltipSettings: tooltipSettings, customTooltip: customTooltip, customTooltipDetails: customTooltipDetails !== null && customTooltipDetails !== void 0 ? customTooltipDetails : spec.renderTooltip }));
            }
        }
        return acc;
    }, []);
}
exports.computeMultipleRectAnnotationTooltipState = computeMultipleRectAnnotationTooltipState;
function getTooltipSettings(_a) {
    var placement = _a.placement, fallbackPlacements = _a.fallbackPlacements, boundary = _a.boundary, offset = _a.offset;
    return {
        placement: placement,
        fallbackPlacements: fallbackPlacements,
        boundary: boundary,
        offset: offset,
    };
}
//# sourceMappingURL=tooltip.js.map