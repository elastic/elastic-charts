"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAnnotationDimensions = exports.invertTransformedCursor = exports.getTransformedCursor = exports.isXDomain = exports.getAnnotationAxis = void 0;
var spec_1 = require("../state/utils/spec");
var specs_1 = require("../utils/specs");
var dimensions_1 = require("./line/dimensions");
var dimensions_2 = require("./rect/dimensions");
function getAnnotationAxis(axesSpecs, groupId, domainType, chartRotation) {
    var _a = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, groupId, chartRotation), xAxis = _a.xAxis, yAxis = _a.yAxis;
    var isXDomainAnnotation = isXDomain(domainType);
    return isXDomainAnnotation ? xAxis === null || xAxis === void 0 ? void 0 : xAxis.position : yAxis === null || yAxis === void 0 ? void 0 : yAxis.position;
}
exports.getAnnotationAxis = getAnnotationAxis;
function isXDomain(domainType) {
    return domainType === specs_1.AnnotationDomainType.XDomain;
}
exports.isXDomain = isXDomain;
function getTransformedCursor(cursorPosition, chartDimensions, chartRotation, projectArea) {
    if (projectArea === void 0) { projectArea = false; }
    var height = chartDimensions.height, width = chartDimensions.width, left = chartDimensions.left, top = chartDimensions.top;
    var x = cursorPosition.x, y = cursorPosition.y;
    if (projectArea) {
        x = cursorPosition.x - left;
        y = cursorPosition.y - top;
    }
    if (chartRotation === null) {
        return { x: x, y: y };
    }
    switch (chartRotation) {
        case 90:
            return { x: y, y: width - x };
        case -90:
            return { x: height - y, y: x };
        case 180:
            return { x: width - x, y: height - y };
        case 0:
        default:
            return { x: x, y: y };
    }
}
exports.getTransformedCursor = getTransformedCursor;
function invertTransformedCursor(cursorPosition, chartDimensions, chartRotation, projectArea) {
    if (projectArea === void 0) { projectArea = false; }
    var height = chartDimensions.height, width = chartDimensions.width, left = chartDimensions.left, top = chartDimensions.top;
    var x = cursorPosition.x, y = cursorPosition.y;
    switch (chartRotation) {
        case 0:
        case null:
            break;
        case 90:
            x = width - cursorPosition.y;
            y = cursorPosition.x;
            break;
        case -90:
            y = height - cursorPosition.x;
            x = cursorPosition.y;
            break;
        case 180:
        default:
            y = height - cursorPosition.y;
            x = width - cursorPosition.x;
    }
    if (projectArea) {
        x += left;
        y += top;
    }
    return { x: x, y: y };
}
exports.invertTransformedCursor = invertTransformedCursor;
function computeAnnotationDimensions(annotations, _a, _b, axesSpecs, isHistogramModeEnabled, smallMultipleScales, getAxisStyle) {
    var chartRotation = _a.rotation;
    var _c = _b.scales, xScale = _c.xScale, yScales = _c.yScales;
    return annotations.reduce(function (annotationDimensions, annotationSpec) {
        var id = annotationSpec.id;
        if ((0, specs_1.isLineAnnotation)(annotationSpec)) {
            var groupId = annotationSpec.groupId, domainType = annotationSpec.domainType;
            var annotationAxisPosition = getAnnotationAxis(axesSpecs, groupId, domainType, chartRotation);
            var dimensions = (0, dimensions_1.computeLineAnnotationDimensions)(annotationSpec, chartRotation, yScales, xScale, smallMultipleScales, isHistogramModeEnabled, annotationAxisPosition);
            if (dimensions) {
                annotationDimensions.set(id, dimensions);
            }
            return annotationDimensions;
        }
        else {
            var dimensions = (0, dimensions_2.computeRectAnnotationDimensions)(annotationSpec, yScales, xScale, axesSpecs, smallMultipleScales, chartRotation, getAxisStyle, isHistogramModeEnabled);
            if (dimensions) {
                annotationDimensions.set(id, dimensions);
            }
            return annotationDimensions;
        }
    }, new Map());
}
exports.computeAnnotationDimensions = computeAnnotationDimensions;
//# sourceMappingURL=utils.js.map