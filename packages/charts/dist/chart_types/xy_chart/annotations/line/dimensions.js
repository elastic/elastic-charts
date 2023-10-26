"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotationLinePropsId = exports.getMarkerPositionForXAnnotation = exports.computeLineAnnotationDimensions = void 0;
const colors_1 = require("../../../../common/colors");
const panel_utils_1 = require("../../../../common/panel_utils");
const types_1 = require("../../../../scales/types");
const common_1 = require("../../../../utils/common");
const merge_utils_1 = require("../../../../utils/themes/merge_utils");
const common_2 = require("../../state/utils/common");
const utils_1 = require("../../state/utils/utils");
const specs_1 = require("../../utils/specs");
function computeYDomainLineAnnotationDimensions(annotationSpec, yScale, { vertical, horizontal }, chartRotation, axisPosition) {
    var _a, _b;
    const { id: specId, dataValues, marker: icon, markerBody: body, markerDimensions: dimension, markerPosition: specMarkerPosition, style, } = annotationSpec;
    const lineStyle = (0, merge_utils_1.mergeWithDefaultAnnotationLine)(style);
    const color = (_b = (_a = lineStyle === null || lineStyle === void 0 ? void 0 : lineStyle.line) === null || _a === void 0 ? void 0 : _a.stroke) !== null && _b !== void 0 ? _b : colors_1.Colors.Red.keyword;
    const isHorizontalChartRotation = (0, common_2.isHorizontalRotation)(chartRotation);
    const lineProps = [];
    const [domainStart, domainEnd] = yScale.domain;
    const panelSize = (0, panel_utils_1.getPanelSize)({ vertical, horizontal });
    dataValues.forEach((datum, i) => {
        const { dataValue } = datum;
        if (!dataValue && dataValue !== 0)
            return;
        const annotationValueYPosition = yScale.scale(dataValue);
        if (Number.isNaN(annotationValueYPosition))
            return;
        if (dataValue < domainStart || dataValue > domainEnd)
            return;
        vertical.domain.forEach((verticalValue) => {
            horizontal.domain.forEach((horizontalValue) => {
                const top = vertical.scale(verticalValue);
                const left = horizontal.scale(horizontalValue);
                if (Number.isNaN(top + left))
                    return;
                const width = isHorizontalChartRotation ? horizontal.bandwidth : vertical.bandwidth;
                const height = isHorizontalChartRotation ? vertical.bandwidth : horizontal.bandwidth;
                const linePathPoints = getYLinePath({ width, height }, annotationValueYPosition);
                const alignment = getAnchorPosition(false, chartRotation, axisPosition, specMarkerPosition);
                const position = getMarkerPositionForYAnnotation(panelSize, chartRotation, alignment, annotationValueYPosition, dimension);
                const lineProp = {
                    specId,
                    id: getAnnotationLinePropsId(specId, datum, i, verticalValue, horizontalValue),
                    datum,
                    linePathPoints,
                    markers: icon
                        ? [
                            {
                                icon,
                                body,
                                color,
                                dimension,
                                position,
                                alignment,
                            },
                        ]
                        : [],
                    panel: {
                        ...panelSize,
                        top,
                        left,
                    },
                };
                lineProps.push(lineProp);
            });
        });
    });
    return lineProps;
}
function computeXDomainLineAnnotationDimensions(annotationSpec, xScale, { vertical, horizontal }, chartRotation, isHistogramMode, axisPosition) {
    var _a, _b;
    const { id: specId, dataValues, marker: icon, markerBody: body, markerDimensions: dimension, markerPosition: specMarkerPosition, style, } = annotationSpec;
    const lineStyle = (0, merge_utils_1.mergeWithDefaultAnnotationLine)(style);
    const color = (_b = (_a = lineStyle === null || lineStyle === void 0 ? void 0 : lineStyle.line) === null || _a === void 0 ? void 0 : _a.stroke) !== null && _b !== void 0 ? _b : colors_1.Colors.Red.keyword;
    const lineProps = [];
    const isHorizontalChartRotation = (0, common_2.isHorizontalRotation)(chartRotation);
    const panelSize = (0, panel_utils_1.getPanelSize)({ vertical, horizontal });
    dataValues.forEach((datum, i) => {
        const { dataValue } = datum;
        let annotationValueXPosition = xScale.scale(dataValue);
        if (Number.isNaN(annotationValueXPosition)) {
            return;
        }
        if ((0, types_1.isContinuousScale)(xScale) && typeof dataValue === 'number') {
            const [minDomain, scaleMaxDomain] = xScale.domain;
            const maxDomain = isHistogramMode ? scaleMaxDomain + xScale.minInterval : scaleMaxDomain;
            if (dataValue < minDomain || dataValue > maxDomain) {
                return;
            }
            if (isHistogramMode) {
                const offset = (0, utils_1.computeXScaleOffset)(xScale, true);
                const pureScaledValue = xScale.pureScale(dataValue);
                if (!Number.isNaN(pureScaledValue)) {
                    annotationValueXPosition = pureScaledValue - offset;
                }
            }
            else {
                annotationValueXPosition += (xScale.bandwidth * xScale.totalBarsInCluster) / 2;
            }
        }
        else if ((0, types_1.isBandScale)(xScale)) {
            annotationValueXPosition += isHistogramMode
                ? -(xScale.step - xScale.originalBandwidth) / 2
                : xScale.originalBandwidth / 2;
        }
        else {
            return;
        }
        if (!isFinite(annotationValueXPosition)) {
            return;
        }
        vertical.domain.forEach((verticalValue) => {
            horizontal.domain.forEach((horizontalValue) => {
                if (Number.isNaN(annotationValueXPosition))
                    return;
                const top = vertical.scale(verticalValue);
                const left = horizontal.scale(horizontalValue);
                if (Number.isNaN(top + left))
                    return;
                const width = isHorizontalChartRotation ? horizontal.bandwidth : vertical.bandwidth;
                const height = isHorizontalChartRotation ? vertical.bandwidth : horizontal.bandwidth;
                const linePathPoints = getXLinePath({ width, height }, annotationValueXPosition);
                const alignment = getAnchorPosition(true, chartRotation, axisPosition, specMarkerPosition);
                const position = getMarkerPositionForXAnnotation(panelSize, chartRotation, alignment, annotationValueXPosition, dimension);
                const lineProp = {
                    specId,
                    id: getAnnotationLinePropsId(specId, datum, i, verticalValue, horizontalValue),
                    datum,
                    linePathPoints,
                    markers: icon
                        ? [
                            {
                                icon,
                                body,
                                color,
                                dimension,
                                position,
                                alignment,
                            },
                        ]
                        : [],
                    panel: {
                        ...panelSize,
                        top,
                        left,
                    },
                };
                lineProps.push(lineProp);
            });
        });
    });
    return lineProps;
}
function computeLineAnnotationDimensions(annotationSpec, chartRotation, yScales, xScale, smallMultipleScales, isHistogramMode, axisPosition) {
    const { domainType, hideLines } = annotationSpec;
    if (hideLines) {
        return null;
    }
    if (domainType === specs_1.AnnotationDomainType.XDomain) {
        return computeXDomainLineAnnotationDimensions(annotationSpec, xScale, smallMultipleScales, chartRotation, isHistogramMode, axisPosition);
    }
    const { groupId } = annotationSpec;
    const yScale = yScales.get(groupId);
    if (!yScale) {
        return null;
    }
    return computeYDomainLineAnnotationDimensions(annotationSpec, yScale, smallMultipleScales, chartRotation, axisPosition);
}
exports.computeLineAnnotationDimensions = computeLineAnnotationDimensions;
function getAnchorPosition(isXDomain, chartRotation, axisPosition, specMarkerPosition) {
    const dflPositionFromAxis = getDefaultMarkerPositionFromAxis(isXDomain, chartRotation, axisPosition);
    if (specMarkerPosition !== undefined) {
        const validatedPosFromMarkerPos = validateMarkerPosition(isXDomain, chartRotation, specMarkerPosition);
        return validatedPosFromMarkerPos !== null && validatedPosFromMarkerPos !== void 0 ? validatedPosFromMarkerPos : dflPositionFromAxis;
    }
    return dflPositionFromAxis;
}
function validateMarkerPosition(isXDomain, chartRotation, position) {
    if ((isXDomain && (0, common_2.isHorizontalRotation)(chartRotation)) || (!isXDomain && (0, common_2.isVerticalRotation)(chartRotation))) {
        return position === common_1.Position.Top || position === common_1.Position.Bottom ? position : undefined;
    }
    return position === common_1.Position.Left || position === common_1.Position.Right ? position : undefined;
}
function getDefaultMarkerPositionFromAxis(isXDomain, chartRotation, axisPosition) {
    if (axisPosition) {
        return axisPosition;
    }
    if ((isXDomain && (0, common_2.isVerticalRotation)(chartRotation)) || (!isXDomain && (0, common_2.isHorizontalRotation)(chartRotation))) {
        return common_1.Position.Left;
    }
    return common_1.Position.Bottom;
}
function getXLinePath({ height }, value) {
    return {
        x1: value,
        y1: 0,
        x2: value,
        y2: height,
    };
}
function getYLinePath({ width }, value) {
    return {
        x1: 0,
        y1: value,
        x2: width,
        y2: value,
    };
}
function getMarkerPositionForXAnnotation({ width, height }, rotation, position, value, { width: mWidth, height: mHeight } = { width: 0, height: 0 }) {
    switch (position) {
        case common_1.Position.Right:
            return {
                top: rotation === -90 ? height - value - mHeight / 2 : value - mHeight / 2,
                left: width,
            };
        case common_1.Position.Left:
            return {
                top: rotation === -90 ? height - value - mHeight / 2 : value - mHeight / 2,
                left: -mWidth,
            };
        case common_1.Position.Top:
            return {
                top: 0 - mHeight,
                left: rotation === 180 ? width - value - mWidth / 2 : value - mWidth / 2,
            };
        case common_1.Position.Bottom:
        default:
            return {
                top: height,
                left: rotation === 180 ? width - value - mWidth / 2 : value - mWidth / 2,
            };
    }
}
exports.getMarkerPositionForXAnnotation = getMarkerPositionForXAnnotation;
function getMarkerPositionForYAnnotation({ width, height }, rotation, position, value, { width: mWidth, height: mHeight } = { width: 0, height: 0 }) {
    switch (position) {
        case common_1.Position.Right:
            return {
                top: rotation === 180 ? height - value - mHeight / 2 : value - mHeight / 2,
                left: width,
            };
        case common_1.Position.Left:
            return {
                top: rotation === 180 ? height - value - mHeight / 2 : value - mHeight / 2,
                left: -mWidth,
            };
        case common_1.Position.Top:
            return {
                top: -mHeight,
                left: rotation === 90 ? width - value - mWidth / 2 : value - mWidth / 2,
            };
        case common_1.Position.Bottom:
        default:
            return {
                top: height,
                left: rotation === 90 ? width - value - mWidth / 2 : value - mWidth / 2,
            };
    }
}
function getAnnotationLinePropsId(specId, datum, index, verticalValue, horizontalValue) {
    return [specId, verticalValue, horizontalValue, datum.header, datum.details, index].join('__');
}
exports.getAnnotationLinePropsId = getAnnotationLinePropsId;
//# sourceMappingURL=dimensions.js.map