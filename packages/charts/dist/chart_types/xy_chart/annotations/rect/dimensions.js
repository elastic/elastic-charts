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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotationRectPropsId = exports.computeRectAnnotationDimensions = exports.isWithinRectBounds = void 0;
var types_1 = require("../../../../scales/types");
var common_1 = require("../../../../utils/common");
var common_2 = require("../../state/utils/common");
var spec_1 = require("../../state/utils/spec");
var panel_1 = require("../../utils/panel");
function isWithinRectBounds(_a, _b) {
    var x = _a.x, y = _a.y;
    var startX = _b.startX, endX = _b.endX, startY = _b.startY, endY = _b.endY;
    var withinXBounds = x >= startX && x <= endX;
    var withinYBounds = y >= startY && y <= endY;
    return withinXBounds && withinYBounds;
}
exports.isWithinRectBounds = isWithinRectBounds;
function computeRectAnnotationDimensions(annotationSpec, yScales, xScale, axesSpecs, smallMultiplesScales, chartRotation, getAxisStyle, isHistogram) {
    if (isHistogram === void 0) { isHistogram = false; }
    var dataValues = annotationSpec.dataValues, groupId = annotationSpec.groupId, outside = annotationSpec.outside, annotationSpecId = annotationSpec.id;
    var _a = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, groupId), xAxis = _a.xAxis, yAxis = _a.yAxis;
    var yScale = yScales.get(groupId);
    var rectsProps = [];
    var panelSize = (0, panel_1.getPanelSize)(smallMultiplesScales);
    dataValues.forEach(function (datum) {
        var _a, _b, _c, _d;
        var _e = datum.coordinates, initialX0 = _e.x0, initialX1 = _e.x1, initialY0 = _e.y0, initialY1 = _e.y1;
        if (initialX0 === null && initialX1 === null && initialY0 === null && initialY1 === null) {
            return;
        }
        var height;
        var _f = __read(limitValueToDomainRange(xScale, initialX0, initialX1, isHistogram), 2), x0 = _f[0], x1 = _f[1];
        if (x0 === null || x1 === null) {
            return;
        }
        var xAndWidth = null;
        if ((0, types_1.isBandScale)(xScale)) {
            xAndWidth = scaleXonBandScale(xScale, x0, x1);
        }
        else if ((0, types_1.isContinuousScale)(xScale)) {
            xAndWidth = scaleXonContinuousScale(xScale, x0, x1, isHistogram);
        }
        if (!xAndWidth) {
            return;
        }
        if (!yScale) {
            if (!(0, common_1.isDefined)(initialY0) && !(0, common_1.isDefined)(initialY1)) {
                var isLeftSide_1 = (chartRotation === 0 && (xAxis === null || xAxis === void 0 ? void 0 : xAxis.position) === common_1.Position.Bottom) ||
                    (chartRotation === 180 && (xAxis === null || xAxis === void 0 ? void 0 : xAxis.position) === common_1.Position.Top) ||
                    (chartRotation === -90 && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.position) === common_1.Position.Right) ||
                    (chartRotation === 90 && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.position) === common_1.Position.Left);
                var orthoDimension_1 = (0, common_2.isHorizontalRotation)(chartRotation) ? panelSize.height : panelSize.width;
                var outsideDim_1 = (_a = annotationSpec.outsideDimension) !== null && _a !== void 0 ? _a : getOutsideDimension(getAxisStyle((_b = xAxis === null || xAxis === void 0 ? void 0 : xAxis.id) !== null && _b !== void 0 ? _b : yAxis === null || yAxis === void 0 ? void 0 : yAxis.id));
                var rectDimensions_1 = __assign(__assign({}, xAndWidth), (outside
                    ? {
                        y: isLeftSide_1 ? orthoDimension_1 : -outsideDim_1,
                        height: outsideDim_1,
                    }
                    : {
                        y: 0,
                        height: orthoDimension_1,
                    }));
                rectsProps.push({
                    specId: annotationSpecId,
                    rect: rectDimensions_1,
                    datum: datum,
                });
            }
            return;
        }
        var _g = __read(limitValueToDomainRange(yScale, initialY0, initialY1), 2), y0 = _g[0], y1 = _g[1];
        if (!Number.isFinite(y0) || !Number.isFinite(y1))
            return;
        var scaledY1 = yScale.pureScale(y1);
        var scaledY0 = yScale.pureScale(y0);
        if (Number.isNaN(scaledY1) || Number.isNaN(scaledY0))
            return;
        height = Math.abs(scaledY0 - scaledY1);
        if (height === 0 && yScale.domain.length === 2 && yScale.domain[0] === yScale.domain[1]) {
            height = panelSize.height;
            scaledY1 = 0;
        }
        var orthoDimension = (0, common_2.isVerticalRotation)(chartRotation) ? panelSize.height : panelSize.width;
        var isLeftSide = (chartRotation === 0 && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.position) === common_1.Position.Left) ||
            (chartRotation === 180 && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.position) === common_1.Position.Right) ||
            (chartRotation === -90 && (xAxis === null || xAxis === void 0 ? void 0 : xAxis.position) === common_1.Position.Bottom) ||
            (chartRotation === 90 && (xAxis === null || xAxis === void 0 ? void 0 : xAxis.position) === common_1.Position.Top);
        var outsideDim = (_c = annotationSpec.outsideDimension) !== null && _c !== void 0 ? _c : getOutsideDimension(getAxisStyle((_d = xAxis === null || xAxis === void 0 ? void 0 : xAxis.id) !== null && _d !== void 0 ? _d : yAxis === null || yAxis === void 0 ? void 0 : yAxis.id));
        var rectDimensions = __assign(__assign({}, (!(0, common_1.isDefined)(initialX0) && !(0, common_1.isDefined)(initialX1) && outside
            ? {
                x: isLeftSide ? -outsideDim : orthoDimension,
                width: outsideDim,
            }
            : xAndWidth)), { y: scaledY1, height: height });
        rectsProps.push({
            specId: annotationSpecId,
            rect: rectDimensions,
            datum: datum,
        });
    });
    return rectsProps.reduce(function (acc, props, i) {
        var duplicated = [];
        smallMultiplesScales.vertical.domain.forEach(function (vDomainValue) {
            smallMultiplesScales.horizontal.domain.forEach(function (hDomainValue) {
                var id = getAnnotationRectPropsId(annotationSpecId, props.datum, i, vDomainValue, hDomainValue);
                var top = smallMultiplesScales.vertical.scale(vDomainValue);
                var left = smallMultiplesScales.horizontal.scale(hDomainValue);
                if (Number.isNaN(top + left))
                    return;
                var panel = __assign(__assign({}, panelSize), { top: top, left: left });
                duplicated.push(__assign(__assign({}, props), { panel: panel, id: id }));
            });
        });
        return __spreadArray(__spreadArray([], __read(acc), false), __read(duplicated), false);
    }, []);
}
exports.computeRectAnnotationDimensions = computeRectAnnotationDimensions;
function scaleXonBandScale(xScale, x0, x1) {
    var _a, _b;
    var padding = (xScale.step - xScale.originalBandwidth) / 2;
    var scaledX1 = xScale.scale(x1);
    var scaledX0 = xScale.scale(x0);
    if (Number.isNaN(scaledX1 + scaledX0)) {
        return null;
    }
    scaledX1 += xScale.originalBandwidth + padding;
    if (scaledX1 > xScale.range[1]) {
        _a = __read(xScale.range, 2), scaledX1 = _a[1];
    }
    scaledX0 -= padding;
    if (scaledX0 < xScale.range[0]) {
        _b = __read(xScale.range, 1), scaledX0 = _b[0];
    }
    var width = Math.abs(scaledX1 - scaledX0);
    return {
        x: scaledX0,
        width: width,
    };
}
function scaleXonContinuousScale(xScale, x0, x1, isHistogramModeEnabled) {
    if (isHistogramModeEnabled === void 0) { isHistogramModeEnabled = false; }
    if (typeof x1 !== 'number' || typeof x0 !== 'number') {
        return null;
    }
    var scaledX0 = xScale.scale(x0);
    var scaledX1 = xScale.totalBarsInCluster > 0 && !isHistogramModeEnabled ? xScale.scale(x1 + xScale.minInterval) : xScale.scale(x1);
    var width = Math.abs(scaledX1 - scaledX0);
    return Number.isNaN(width)
        ? null
        : { width: width, x: scaledX0 - (xScale.bandwidthPadding / 2) * xScale.totalBarsInCluster };
}
function limitValueToDomainRange(scale, minValue, maxValue, isHistogram) {
    if (isHistogram === void 0) { isHistogram = false; }
    if ((0, types_1.isContinuousScale)(scale)) {
        var _a = __read(scale.domain, 2), domainStartValue = _a[0], domainEndValue = _a[1];
        var min = maxOf(domainStartValue, minValue);
        var max = minOf(isHistogram ? domainEndValue + scale.minInterval : domainEndValue, maxValue);
        return min !== null && max !== null && min > max ? [null, null] : [min, max];
    }
    else {
        var min = (0, common_1.isNil)(minValue) || !scale.domain.includes(minValue) ? scale.domain[0] : minValue;
        var max = (0, common_1.isNil)(maxValue) || !scale.domain.includes(maxValue) ? scale.domain[scale.domain.length - 1] : maxValue;
        return [min, max];
    }
}
function minOf(base, value) {
    return typeof value === 'number' ? Math.min(value, base) : typeof value === 'string' ? value : base;
}
function maxOf(base, value) {
    return typeof value === 'number' ? Math.max(value, base) : typeof value === 'string' ? value : base;
}
function getOutsideDimension(style) {
    var _a = style.tickLine, visible = _a.visible, size = _a.size, strokeWidth = _a.strokeWidth;
    return visible && size > 0 && strokeWidth > 0 ? size : 0;
}
function getAnnotationRectPropsId(specId, datum, index, verticalValue, horizontalValue) {
    return __spreadArray(__spreadArray([specId, verticalValue, horizontalValue], __read(Object.values(datum.coordinates)), false), [datum.details, index], false).join('__');
}
exports.getAnnotationRectPropsId = getAnnotationRectPropsId;
//# sourceMappingURL=dimensions.js.map