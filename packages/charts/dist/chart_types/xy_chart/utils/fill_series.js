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
exports.fillSeries = void 0;
var constants_1 = require("../../../scales/constants");
var specs_1 = require("./specs");
function fillSeries(dataSeries, xValues, groupScaleType) {
    var sortedXValues = __spreadArray([], __read(xValues.values()), false);
    return dataSeries.map(function (series) {
        var spec = series.spec, data = series.data, isStacked = series.isStacked;
        var noFillRequired = isXFillNotRequired(spec, groupScaleType, isStacked);
        if (data.length === xValues.size || noFillRequired) {
            return __assign(__assign({}, series), { data: data });
        }
        var filledData = [];
        var missingValues = new Set(xValues);
        for (var i = 0; i < data.length; i++) {
            var x = data[i].x;
            filledData.push(data[i]);
            missingValues.delete(x);
        }
        var missingValuesArray = __spreadArray([], __read(missingValues.values()), false);
        for (var i = 0; i < missingValuesArray.length; i++) {
            var missingValue = missingValuesArray[i];
            var index = sortedXValues.indexOf(missingValue);
            filledData.splice(index, 0, {
                x: missingValue,
                y1: null,
                y0: null,
                initialY1: null,
                initialY0: null,
                mark: null,
                datum: undefined,
                filled: {
                    x: missingValue,
                },
            });
        }
        return __assign(__assign({}, series), { data: filledData });
    });
}
exports.fillSeries = fillSeries;
function isXFillNotRequired(spec, groupScaleType, isStacked) {
    var onlyNoFitAreaLine = ((0, specs_1.isAreaSeriesSpec)(spec) || (0, specs_1.isLineSeriesSpec)(spec)) && !spec.fit;
    var onlyContinuous = groupScaleType === constants_1.ScaleType.Linear ||
        groupScaleType === constants_1.ScaleType.LinearBinary ||
        groupScaleType === constants_1.ScaleType.Time;
    return onlyNoFitAreaLine && onlyContinuous && !isStacked;
}
//# sourceMappingURL=fill_series.js.map