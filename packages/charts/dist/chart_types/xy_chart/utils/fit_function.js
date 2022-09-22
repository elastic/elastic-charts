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
exports.fitFunction = exports.parseConfig = exports.getValue = void 0;
var constants_1 = require("../../../scales/constants");
var specs_1 = require("./specs");
var stacked_series_utils_1 = require("./stacked_series_utils");
var getXYValues = function (_a) {
    var x = _a.x, y1 = _a.y1, fittingIndex = _a.fittingIndex;
    return [
        typeof x === 'string' ? fittingIndex : x,
        y1,
    ];
};
var getValue = function (current, currentIndex, previous, next, type, endValue) {
    if (previous !== null && type === specs_1.Fit.Carry) {
        var y1 = previous.y1;
        return __assign(__assign({}, current), { y1: y1, filled: __assign(__assign({}, current.filled), { y1: y1 }) });
    }
    if (next !== null && type === specs_1.Fit.Lookahead) {
        var y1 = next.y1;
        return __assign(__assign({}, current), { y1: y1, filled: __assign(__assign({}, current.filled), { y1: y1 }) });
    }
    if (previous !== null && next !== null) {
        if (type === specs_1.Fit.Average) {
            var y1 = (previous.y1 + next.y1) / 2;
            return __assign(__assign({}, current), { y1: y1, filled: __assign(__assign({}, current.filled), { y1: y1 }) });
        }
        if (current.x !== null && previous.x !== null && next.x !== null) {
            var _a = __read(getXYValues(previous), 2), x1 = _a[0], y1 = _a[1];
            var _b = __read(getXYValues(next), 2), x2 = _b[0], y2 = _b[1];
            var currentX = typeof current.x === 'string' ? currentIndex : current.x;
            if (type === specs_1.Fit.Nearest) {
                var x1Delta = Math.abs(currentX - x1);
                var x2Delta = Math.abs(currentX - x2);
                var y1Delta = x1Delta > x2Delta ? y2 : y1;
                return __assign(__assign({}, current), { y1: y1Delta, filled: __assign(__assign({}, current.filled), { y1: y1Delta }) });
            }
            if (type === specs_1.Fit.Linear) {
                var linearInterpolatedY1 = previous.y1 + (currentX - x1) * ((y2 - y1) / (x2 - x1));
                return __assign(__assign({}, current), { y1: linearInterpolatedY1, filled: __assign(__assign({}, current.filled), { y1: linearInterpolatedY1 }) });
            }
        }
    }
    else if ((previous !== null || next !== null) && (type === specs_1.Fit.Nearest || endValue === 'nearest')) {
        var nearestY1 = previous !== null ? previous.y1 : next.y1;
        return __assign(__assign({}, current), { y1: nearestY1, filled: __assign(__assign({}, current.filled), { y1: nearestY1 }) });
    }
    if (endValue === undefined || typeof endValue === 'string') {
        return current;
    }
    return __assign(__assign({}, current), { y1: endValue, filled: __assign(__assign({}, current.filled), { y1: endValue }) });
};
exports.getValue = getValue;
var parseConfig = function (config) {
    if (!config) {
        return {
            type: specs_1.Fit.None,
        };
    }
    if (typeof config === 'string') {
        return {
            type: config,
        };
    }
    if (config.type === specs_1.Fit.Explicit && config.value === undefined) {
        return {
            type: specs_1.Fit.None,
        };
    }
    return {
        type: config.type,
        value: config.type === specs_1.Fit.Explicit ? config.value : undefined,
        endValue: config.endValue,
    };
};
exports.parseConfig = parseConfig;
var fitFunction = function (data, fitConfig, xScaleType, sorted) {
    if (sorted === void 0) { sorted = false; }
    var _a = (0, exports.parseConfig)(fitConfig), type = _a.type, value = _a.value, endValue = _a.endValue;
    if (type === specs_1.Fit.None) {
        return data;
    }
    if (type === specs_1.Fit.Zero) {
        return data.map(function (datum) { return (__assign(__assign({}, datum), { y1: datum.y1 === null ? 0 : datum.y1, filled: __assign(__assign({}, datum.filled), { y1: datum.y1 === null ? 0 : undefined }) })); });
    }
    if (type === specs_1.Fit.Explicit) {
        if (value === undefined) {
            return data;
        }
        return data.map(function (datum) { return (__assign(__assign({}, datum), { y1: datum.y1 === null ? value : datum.y1, filled: __assign(__assign({}, datum.filled), { y1: datum.y1 === null ? value : undefined }) })); });
    }
    var sortedData = sorted || xScaleType === constants_1.ScaleType.Ordinal ? data : data.slice().sort((0, stacked_series_utils_1.datumXSortPredicate)(xScaleType));
    var newData = [];
    var previousNonNullDatum = null;
    var nextNonNullDatum = null;
    for (var i = 0; i < sortedData.length; i++) {
        var j = i;
        var currentValue = sortedData[i];
        if (currentValue.y1 === null &&
            nextNonNullDatum === null &&
            (type === specs_1.Fit.Lookahead ||
                type === specs_1.Fit.Nearest ||
                type === specs_1.Fit.Average ||
                type === specs_1.Fit.Linear ||
                endValue === 'nearest')) {
            for (j = i + 1; j < sortedData.length; j++) {
                var nextValue = sortedData[j];
                if (nextValue.y1 !== null && nextValue.x !== null) {
                    nextNonNullDatum = __assign(__assign({}, nextValue), { fittingIndex: j });
                    break;
                }
            }
        }
        var newValue = currentValue.y1 === null
            ? (0, exports.getValue)(currentValue, i, previousNonNullDatum, nextNonNullDatum, type, endValue)
            : currentValue;
        newData[i] = newValue;
        if (currentValue.y1 !== null && currentValue.x !== null) {
            previousNonNullDatum = __assign(__assign({}, currentValue), { fittingIndex: i });
        }
        if (nextNonNullDatum !== null && nextNonNullDatum.x <= currentValue.x) {
            nextNonNullDatum = null;
        }
    }
    return newData;
};
exports.fitFunction = fitFunction;
//# sourceMappingURL=fit_function.js.map