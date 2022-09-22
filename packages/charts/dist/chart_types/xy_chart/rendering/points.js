"use strict";
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
exports.getRadiusFn = exports.getDatumYValue = exports.getPointStyleOverrides = exports.renderPoints = void 0;
var common_1 = require("../../../utils/common");
var geometry_1 = require("../../../utils/geometry");
var indexed_geometry_map_1 = require("../utils/indexed_geometry_map");
var series_1 = require("../utils/series");
var specs_1 = require("../utils/specs");
var point_style_1 = require("./point_style");
var utils_1 = require("./utils");
function renderPoints(shift, dataSeries, xScale, yScale, panel, color, pointStyle, isBandChart, markSizeOptions, useSpatialIndex, styleAccessor) {
    var indexedGeometryMap = new indexed_geometry_map_1.IndexedGeometryMap();
    var getRadius = markSizeOptions.enabled
        ? getRadiusFn(dataSeries.data, pointStyle.strokeWidth, markSizeOptions.ratio)
        : function () { return 0; };
    var geometryType = useSpatialIndex ? indexed_geometry_map_1.GeometryType.spatial : indexed_geometry_map_1.GeometryType.linear;
    var y1Fn = (0, utils_1.getY1ScaledValueFn)(yScale);
    var y0Fn = (0, utils_1.getY0ScaledValueFn)(yScale);
    var yDefined = (0, utils_1.isYValueDefinedFn)(yScale, xScale);
    var pointGeometries = dataSeries.data.reduce(function (acc, datum, dataIndex) {
        var xValue = datum.x, mark = datum.mark;
        var prev = dataSeries.data[dataIndex - 1];
        var next = dataSeries.data[dataIndex + 1];
        if (!xScale.isValueInDomain(xValue))
            return acc;
        var x = xScale.scale(xValue);
        if (Number.isNaN(x))
            return acc;
        var points = [];
        var yDatumKeyNames = isBandChart ? ['y0', 'y1'] : ['y1'];
        yDatumKeyNames.forEach(function (yDatumKeyName, keyIndex) {
            var _a;
            var valueAccessor = (0, utils_1.getYDatumValueFn)(yDatumKeyName);
            var y = yDatumKeyName === 'y1' ? y1Fn(datum) : y0Fn(datum);
            var originalY = getDatumYValue(datum, keyIndex === 0, isBandChart, dataSeries.stackMode);
            var seriesIdentifier = (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries);
            var styleOverrides = getPointStyleOverrides(datum, seriesIdentifier, styleAccessor);
            var style = (0, point_style_1.buildPointGeometryStyles)(color, pointStyle, styleOverrides);
            var orphan = isOrphanDataPoint(dataIndex, dataSeries.data.length, yDefined, prev, next);
            var radius = markSizeOptions.enabled
                ? Math.max(getRadius(mark), pointStyle.radius)
                : (_a = styleOverrides === null || styleOverrides === void 0 ? void 0 : styleOverrides.radius) !== null && _a !== void 0 ? _a : pointStyle.radius;
            var pointGeometry = {
                x: x,
                y: y === null ? NaN : y,
                radius: radius,
                color: color,
                style: style,
                value: {
                    x: xValue,
                    y: originalY,
                    mark: mark,
                    accessor: isBandChart && keyIndex === 0 ? geometry_1.BandedAccessorType.Y0 : geometry_1.BandedAccessorType.Y1,
                    datum: datum.datum,
                },
                transform: {
                    x: shift,
                    y: 0,
                },
                seriesIdentifier: seriesIdentifier,
                panel: panel,
                orphan: orphan,
            };
            indexedGeometryMap.set(pointGeometry, geometryType);
            if ((0, common_1.isFiniteNumber)(y) &&
                yDefined(datum, valueAccessor) &&
                yScale.isValueInDomain(valueAccessor(datum)) &&
                !(0, utils_1.isDatumFilled)(datum)) {
                points.push(pointGeometry);
            }
        });
        return __spreadArray(__spreadArray([], __read(acc), false), __read(points), false);
    }, []);
    return {
        pointGeometries: pointGeometries,
        indexedGeometryMap: indexedGeometryMap,
    };
}
exports.renderPoints = renderPoints;
function getPointStyleOverrides(datum, seriesIdentifier, pointStyleAccessor) {
    var styleOverride = pointStyleAccessor && pointStyleAccessor(datum, seriesIdentifier);
    if (!styleOverride) {
        return;
    }
    if (typeof styleOverride === 'string') {
        return {
            stroke: styleOverride,
        };
    }
    return styleOverride;
}
exports.getPointStyleOverrides = getPointStyleOverrides;
function getDatumYValue(_a, lookingForY0, isBandChart, stackMode) {
    var y1 = _a.y1, y0 = _a.y0, initialY1 = _a.initialY1, initialY0 = _a.initialY0;
    if (isBandChart) {
        return stackMode === specs_1.StackMode.Percentage ? (lookingForY0 ? y0 : y1) : lookingForY0 ? initialY0 : initialY1;
    }
    return stackMode === specs_1.StackMode.Percentage ? ((0, common_1.isNil)(y1) || (0, common_1.isNil)(initialY1) ? null : y1 - (y0 !== null && y0 !== void 0 ? y0 : 0)) : initialY1;
}
exports.getDatumYValue = getDatumYValue;
function getRadiusFn(data, lineWidth, markSizeRatio) {
    if (markSizeRatio === void 0) { markSizeRatio = 50; }
    if (data.length === 0) {
        return function () { return 0; };
    }
    var _a = data.reduce(function (acc, _a) {
        var mark = _a.mark;
        return mark === null
            ? acc
            : {
                min: Math.min(acc.min, mark / 2),
                max: Math.max(acc.max, mark / 2),
            };
    }, { min: Infinity, max: -Infinity }), min = _a.min, max = _a.max;
    var adjustedMarkSizeRatio = Math.min(Math.max(markSizeRatio, 0), 100);
    var radiusStep = (max - min || max * 100) / Math.pow(adjustedMarkSizeRatio, 2);
    return function getRadius(mark, defaultRadius) {
        if (defaultRadius === void 0) { defaultRadius = 0; }
        if (mark === null) {
            return defaultRadius;
        }
        var circleRadius = (mark / 2 - min) / radiusStep;
        var baseMagicNumber = 2;
        return circleRadius ? Math.sqrt(circleRadius + baseMagicNumber) + lineWidth : lineWidth;
    };
}
exports.getRadiusFn = getRadiusFn;
function yAccessorForOrphanCheck(datum) {
    var _a;
    return ((_a = datum.filled) === null || _a === void 0 ? void 0 : _a.y1) ? null : datum.y1;
}
function isOrphanDataPoint(index, length, yDefined, prev, next) {
    if (index === 0 && ((0, common_1.isNil)(next) || !yDefined(next, yAccessorForOrphanCheck))) {
        return true;
    }
    if (index === length - 1 && ((0, common_1.isNil)(prev) || !yDefined(prev, yAccessorForOrphanCheck))) {
        return true;
    }
    return (((0, common_1.isNil)(prev) || !yDefined(prev, yAccessorForOrphanCheck)) &&
        ((0, common_1.isNil)(next) || !yDefined(next, yAccessorForOrphanCheck)));
}
//# sourceMappingURL=points.js.map