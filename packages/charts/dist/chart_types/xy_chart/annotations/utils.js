"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAnnotationDimensions = exports.invertTransformedCursor = exports.getTransformedCursor = exports.isXDomain = exports.getAnnotationAxis = void 0;
const dimensions_1 = require("./line/dimensions");
const dimensions_2 = require("./rect/dimensions");
const spec_1 = require("../state/utils/spec");
const specs_1 = require("../utils/specs");
function getAnnotationAxis(axesSpecs, groupId, domainType, chartRotation) {
    const { xAxis, yAxis } = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, groupId, chartRotation);
    const isXDomainAnnotation = isXDomain(domainType);
    return isXDomainAnnotation ? xAxis === null || xAxis === void 0 ? void 0 : xAxis.position : yAxis === null || yAxis === void 0 ? void 0 : yAxis.position;
}
exports.getAnnotationAxis = getAnnotationAxis;
function isXDomain(domainType) {
    return domainType === specs_1.AnnotationDomainType.XDomain;
}
exports.isXDomain = isXDomain;
function getTransformedCursor(cursorPosition, chartDimensions, chartRotation, projectArea = false) {
    const { height, width, left, top } = chartDimensions;
    let { x, y } = cursorPosition;
    if (projectArea) {
        x = cursorPosition.x - left;
        y = cursorPosition.y - top;
    }
    if (chartRotation === null) {
        return { x, y };
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
            return { x, y };
    }
}
exports.getTransformedCursor = getTransformedCursor;
function invertTransformedCursor(cursorPosition, chartDimensions, chartRotation, projectArea = false) {
    const { height, width, left, top } = chartDimensions;
    let { x, y } = cursorPosition;
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
    return { x, y };
}
exports.invertTransformedCursor = invertTransformedCursor;
function computeAnnotationDimensions(annotations, { rotation: chartRotation }, { scales: { xScale, yScales } }, axesSpecs, isHistogramModeEnabled, smallMultipleScales, getAxisStyle) {
    return annotations.reduce((annotationDimensions, annotationSpec) => {
        const { id } = annotationSpec;
        if ((0, specs_1.isLineAnnotation)(annotationSpec)) {
            const { groupId, domainType } = annotationSpec;
            const annotationAxisPosition = getAnnotationAxis(axesSpecs, groupId, domainType, chartRotation);
            const dimensions = (0, dimensions_1.computeLineAnnotationDimensions)(annotationSpec, chartRotation, yScales, xScale, smallMultipleScales, isHistogramModeEnabled, annotationAxisPosition);
            if (dimensions) {
                annotationDimensions.set(id, dimensions);
            }
            return annotationDimensions;
        }
        else {
            const dimensions = (0, dimensions_2.computeRectAnnotationDimensions)(annotationSpec, yScales, xScale, axesSpecs, smallMultipleScales, chartRotation, getAxisStyle, isHistogramModeEnabled);
            if (dimensions) {
                annotationDimensions.set(id, dimensions);
            }
            return annotationDimensions;
        }
    }, new Map());
}
exports.computeAnnotationDimensions = computeAnnotationDimensions;
//# sourceMappingURL=utils.js.map