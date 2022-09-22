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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotationLinePropsId = exports.getMarkerPositionForXAnnotation = exports.computeLineAnnotationDimensions = void 0;
var colors_1 = require("../../../../common/colors");
var types_1 = require("../../../../scales/types");
var common_1 = require("../../../../utils/common");
var merge_utils_1 = require("../../../../utils/themes/merge_utils");
var common_2 = require("../../state/utils/common");
var utils_1 = require("../../state/utils/utils");
var panel_1 = require("../../utils/panel");
var specs_1 = require("../../utils/specs");
function computeYDomainLineAnnotationDimensions(annotationSpec, yScale, _a, chartRotation, axisPosition) {
    var _b, _c;
    var vertical = _a.vertical, horizontal = _a.horizontal;
    var specId = annotationSpec.id, dataValues = annotationSpec.dataValues, icon = annotationSpec.marker, body = annotationSpec.markerBody, dimension = annotationSpec.markerDimensions, specMarkerPosition = annotationSpec.markerPosition, style = annotationSpec.style;
    var lineStyle = (0, merge_utils_1.mergeWithDefaultAnnotationLine)(style);
    var color = (_c = (_b = lineStyle === null || lineStyle === void 0 ? void 0 : lineStyle.line) === null || _b === void 0 ? void 0 : _b.stroke) !== null && _c !== void 0 ? _c : colors_1.Colors.Red.keyword;
    var isHorizontalChartRotation = (0, common_2.isHorizontalRotation)(chartRotation);
    var lineProps = [];
    var _d = __read(yScale.domain, 2), domainStart = _d[0], domainEnd = _d[1];
    var panelSize = (0, panel_1.getPanelSize)({ vertical: vertical, horizontal: horizontal });
    dataValues.forEach(function (datum, i) {
        var dataValue = datum.dataValue;
        if (!dataValue && dataValue !== 0)
            return;
        var annotationValueYPosition = yScale.scale(dataValue);
        if (Number.isNaN(annotationValueYPosition))
            return;
        if (dataValue < domainStart || dataValue > domainEnd)
            return;
        vertical.domain.forEach(function (verticalValue) {
            horizontal.domain.forEach(function (horizontalValue) {
                var top = vertical.scale(verticalValue);
                var left = horizontal.scale(horizontalValue);
                if (Number.isNaN(top + left))
                    return;
                var width = isHorizontalChartRotation ? horizontal.bandwidth : vertical.bandwidth;
                var height = isHorizontalChartRotation ? vertical.bandwidth : horizontal.bandwidth;
                var linePathPoints = getYLinePath({ width: width, height: height }, annotationValueYPosition);
                var alignment = getAnchorPosition(false, chartRotation, axisPosition, specMarkerPosition);
                var position = getMarkerPositionForYAnnotation(panelSize, chartRotation, alignment, annotationValueYPosition, dimension);
                var lineProp = {
                    specId: specId,
                    id: getAnnotationLinePropsId(specId, datum, i, verticalValue, horizontalValue),
                    datum: datum,
                    linePathPoints: linePathPoints,
                    markers: icon
                        ? [
                            {
                                icon: icon,
                                body: body,
                                color: color,
                                dimension: dimension,
                                position: position,
                                alignment: alignment,
                            },
                        ]
                        : [],
                    panel: __assign(__assign({}, panelSize), { top: top, left: left }),
                };
                lineProps.push(lineProp);
            });
        });
    });
    return lineProps;
}
function computeXDomainLineAnnotationDimensions(annotationSpec, xScale, _a, chartRotation, isHistogramMode, axisPosition) {
    var _b, _c;
    var vertical = _a.vertical, horizontal = _a.horizontal;
    var specId = annotationSpec.id, dataValues = annotationSpec.dataValues, icon = annotationSpec.marker, body = annotationSpec.markerBody, dimension = annotationSpec.markerDimensions, specMarkerPosition = annotationSpec.markerPosition, style = annotationSpec.style;
    var lineStyle = (0, merge_utils_1.mergeWithDefaultAnnotationLine)(style);
    var color = (_c = (_b = lineStyle === null || lineStyle === void 0 ? void 0 : lineStyle.line) === null || _b === void 0 ? void 0 : _b.stroke) !== null && _c !== void 0 ? _c : colors_1.Colors.Red.keyword;
    var lineProps = [];
    var isHorizontalChartRotation = (0, common_2.isHorizontalRotation)(chartRotation);
    var panelSize = (0, panel_1.getPanelSize)({ vertical: vertical, horizontal: horizontal });
    dataValues.forEach(function (datum, i) {
        var dataValue = datum.dataValue;
        var annotationValueXPosition = xScale.scale(dataValue);
        if (Number.isNaN(annotationValueXPosition)) {
            return;
        }
        if ((0, types_1.isContinuousScale)(xScale) && typeof dataValue === 'number') {
            var _a = __read(xScale.domain, 1), minDomain = _a[0];
            var maxDomain = isHistogramMode ? xScale.domain[1] + xScale.minInterval : xScale.domain[1];
            if (dataValue < minDomain || dataValue > maxDomain) {
                return;
            }
            if (isHistogramMode) {
                var offset = (0, utils_1.computeXScaleOffset)(xScale, true);
                var pureScaledValue = xScale.pureScale(dataValue);
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
        vertical.domain.forEach(function (verticalValue) {
            horizontal.domain.forEach(function (horizontalValue) {
                if (Number.isNaN(annotationValueXPosition))
                    return;
                var top = vertical.scale(verticalValue);
                var left = horizontal.scale(horizontalValue);
                if (Number.isNaN(top + left))
                    return;
                var width = isHorizontalChartRotation ? horizontal.bandwidth : vertical.bandwidth;
                var height = isHorizontalChartRotation ? vertical.bandwidth : horizontal.bandwidth;
                var linePathPoints = getXLinePath({ width: width, height: height }, annotationValueXPosition);
                var alignment = getAnchorPosition(true, chartRotation, axisPosition, specMarkerPosition);
                var position = getMarkerPositionForXAnnotation(panelSize, chartRotation, alignment, annotationValueXPosition, dimension);
                var lineProp = {
                    specId: specId,
                    id: getAnnotationLinePropsId(specId, datum, i, verticalValue, horizontalValue),
                    datum: datum,
                    linePathPoints: linePathPoints,
                    markers: icon
                        ? [
                            {
                                icon: icon,
                                body: body,
                                color: color,
                                dimension: dimension,
                                position: position,
                                alignment: alignment,
                            },
                        ]
                        : [],
                    panel: __assign(__assign({}, panelSize), { top: top, left: left }),
                };
                lineProps.push(lineProp);
            });
        });
    });
    return lineProps;
}
function computeLineAnnotationDimensions(annotationSpec, chartRotation, yScales, xScale, smallMultipleScales, isHistogramMode, axisPosition) {
    var domainType = annotationSpec.domainType, hideLines = annotationSpec.hideLines;
    if (hideLines) {
        return null;
    }
    if (domainType === specs_1.AnnotationDomainType.XDomain) {
        return computeXDomainLineAnnotationDimensions(annotationSpec, xScale, smallMultipleScales, chartRotation, isHistogramMode, axisPosition);
    }
    var groupId = annotationSpec.groupId;
    var yScale = yScales.get(groupId);
    if (!yScale) {
        return null;
    }
    return computeYDomainLineAnnotationDimensions(annotationSpec, yScale, smallMultipleScales, chartRotation, axisPosition);
}
exports.computeLineAnnotationDimensions = computeLineAnnotationDimensions;
function getAnchorPosition(isXDomain, chartRotation, axisPosition, specMarkerPosition) {
    var dflPositionFromAxis = getDefaultMarkerPositionFromAxis(isXDomain, chartRotation, axisPosition);
    if (specMarkerPosition !== undefined) {
        var validatedPosFromMarkerPos = validateMarkerPosition(isXDomain, chartRotation, specMarkerPosition);
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
function getXLinePath(_a, value) {
    var height = _a.height;
    return {
        x1: value,
        y1: 0,
        x2: value,
        y2: height,
    };
}
function getYLinePath(_a, value) {
    var width = _a.width;
    return {
        x1: 0,
        y1: value,
        x2: width,
        y2: value,
    };
}
function getMarkerPositionForXAnnotation(_a, rotation, position, value, _b) {
    var width = _a.width, height = _a.height;
    var _c = _b === void 0 ? { width: 0, height: 0 } : _b, mWidth = _c.width, mHeight = _c.height;
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
function getMarkerPositionForYAnnotation(_a, rotation, position, value, _b) {
    var width = _a.width, height = _a.height;
    var _c = _b === void 0 ? { width: 0, height: 0 } : _b, mWidth = _c.width, mHeight = _c.height;
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