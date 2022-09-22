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
exports.formatStackedDataSeriesValues = exports.datumXSortPredicate = void 0;
var d3_shape_1 = require("d3-shape");
var constants_1 = require("../../../scales/constants");
var common_1 = require("../../../utils/common");
var logger_1 = require("../../../utils/logger");
var diverging_offsets_1 = require("./diverging_offsets");
var specs_1 = require("./specs");
var datumXSortPredicate = function (xScaleType, sortedXValues) {
    return function (a, b) {
        if (xScaleType === constants_1.ScaleType.Ordinal || typeof a.x === 'string' || typeof b.x === 'string') {
            return sortedXValues ? sortedXValues.indexOf(a.x) - sortedXValues.indexOf(b.x) : 0;
        }
        return a.x - b.x;
    };
};
exports.datumXSortPredicate = datumXSortPredicate;
function formatStackedDataSeriesValues(dataSeries, xValues, seriesType, stackMode) {
    var dataSeriesMap = dataSeries.reduce(function (acc, curr) {
        return acc.set(curr.key, curr);
    }, new Map());
    var hasNegative = false;
    var hasPositive = false;
    var xMap = new Map();
    __spreadArray([], __read(xValues), false).forEach(function (xValue) {
        var seriesMap = new Map();
        dataSeries.forEach(function (_a) {
            var _b;
            var key = _a.key, data = _a.data, isFiltered = _a.isFiltered;
            if (isFiltered)
                return;
            var datum = data.find(function (_a) {
                var x = _a.x;
                return x === xValue;
            });
            if (!datum)
                return;
            var y1 = (_b = datum.y1) !== null && _b !== void 0 ? _b : 0;
            if (hasPositive || y1 > 0)
                hasPositive = true;
            if (hasNegative || y1 < 0)
                hasNegative = true;
            seriesMap.set("".concat(key, "-y0"), datum);
            seriesMap.set(key, datum);
        });
        xMap.set(xValue, seriesMap);
    });
    if (hasNegative && hasPositive && seriesType === specs_1.SeriesType.Area) {
        logger_1.Logger.warn("Area series should be avoided with dataset containing positive and negative values. Use a bar series instead.");
    }
    var keys = __spreadArray([], __read(dataSeriesMap.keys()), false).reduce(function (acc, key) { return __spreadArray(__spreadArray([], __read(acc), false), ["".concat(key, "-y0"), key], false); }, []);
    var stackOffset = getOffsetBasedOnStackMode(stackMode, hasNegative && !hasPositive);
    var stack = (0, d3_shape_1.stack)()
        .keys(keys)
        .value(function (_a, key) {
        var _b, _c;
        var _d = __read(_a, 2), indexMap = _d[1];
        var datum = indexMap.get(key);
        if (!datum)
            return 0;
        return key.endsWith('-y0') ? (_b = datum.y0) !== null && _b !== void 0 ? _b : 0 : (_c = datum.y1) !== null && _c !== void 0 ? _c : 0;
    })
        .order(d3_shape_1.stackOrderNone)
        .offset(stackOffset)(xMap)
        .filter(function (_a) {
        var key = _a.key;
        return !key.endsWith('-y0');
    });
    return stack
        .map(function (stackedSeries) {
        var dataSeriesProps = dataSeriesMap.get(stackedSeries.key);
        if (!dataSeriesProps)
            return null;
        var data = stackedSeries
            .map(function (row) {
            var d = row.data[1].get(stackedSeries.key);
            if (!d || d.x === undefined || d.x === null)
                return null;
            var initialY0 = d.initialY0, initialY1 = d.initialY1, mark = d.mark, datum = d.datum, filled = d.filled, x = d.x;
            var _a = __read(row, 2), y0 = _a[0], y1 = _a[1];
            return {
                x: x,
                y1: clampIfStackedAsPercentage(y1, stackMode),
                y0: clampIfStackedAsPercentage(y0, stackMode),
                initialY0: initialY0,
                initialY1: initialY1,
                mark: mark,
                datum: datum,
                filled: filled,
            };
        })
            .filter(common_1.isDefined);
        return __assign(__assign({}, dataSeriesProps), { data: data });
    })
        .filter(common_1.isDefined);
}
exports.formatStackedDataSeriesValues = formatStackedDataSeriesValues;
function clampIfStackedAsPercentage(value, stackMode) {
    return stackMode === specs_1.StackMode.Percentage ? (0, common_1.clamp)(value, 0, 1) : value;
}
function getOffsetBasedOnStackMode(stackMode, onlyNegative) {
    if (onlyNegative === void 0) { onlyNegative = false; }
    if (onlyNegative && stackMode === specs_1.StackMode.Wiggle)
        return d3_shape_1.stackOffsetWiggle;
    switch (stackMode) {
        case specs_1.StackMode.Percentage:
            return diverging_offsets_1.divergingPercentage;
        case specs_1.StackMode.Silhouette:
            return diverging_offsets_1.divergingSilhouette;
        case specs_1.StackMode.Wiggle:
            return diverging_offsets_1.divergingWiggle;
        default:
            return diverging_offsets_1.diverging;
    }
}
//# sourceMappingURL=stacked_series_utils.js.map