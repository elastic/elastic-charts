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
exports.shapeViewModel = void 0;
var scales_1 = require("../../../../scales");
var constants_1 = require("../../specs/constants");
var common_1 = require("./../../../../utils/common");
function shapeViewModel(spec, theme, chartDimensions) {
    var width = chartDimensions.width, height = chartDimensions.height;
    var margin = theme.chartMargins;
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    var chartCenter = {
        x: margin.left + innerWidth / 2,
        y: margin.top + innerHeight / 2,
    };
    var subtype = spec.subtype, ticks = spec.ticks, bands = spec.bands, domain = spec.domain, bandFillColor = spec.bandFillColor, tickValueFormatter = spec.tickValueFormatter, labelMajor = spec.labelMajor, labelMinor = spec.labelMinor, centralMajor = spec.centralMajor, centralMinor = spec.centralMinor, bandLabels = spec.bandLabels, angleStart = spec.angleStart, angleEnd = spec.angleEnd;
    var lowestValue = (0, common_1.isFiniteNumber)(domain.min) ? domain.min : 0;
    var highestValue = (0, common_1.isFiniteNumber)(domain.max) ? domain.max : 1;
    var base = (0, common_1.clamp)(spec.base, lowestValue, highestValue);
    var target = !(0, common_1.isNil)(spec.target) && spec.target <= highestValue && spec.target >= lowestValue ? spec.target : undefined;
    var actual = (0, common_1.clamp)(spec.actual, lowestValue, highestValue);
    var finalTicks = Array.isArray(ticks)
        ? ticks.filter((0, common_1.isBetween)(lowestValue, highestValue))
        : new scales_1.ScaleContinuous({
            type: 'linear',
            domain: [lowestValue, highestValue],
            range: [0, 1],
        }, {
            desiredTickCount: ticks !== null && ticks !== void 0 ? ticks : getDesiredTicks(subtype, angleStart, angleEnd),
        }).ticks();
    var finalBands = Array.isArray(bands)
        ? bands.reduce.apply(bands, __spreadArray([], __read((0, common_1.clampAll)(lowestValue, highestValue)), false)) : new scales_1.ScaleContinuous({
        type: 'linear',
        domain: [lowestValue, highestValue],
        range: [0, 1],
    }, {
        desiredTickCount: bands !== null && bands !== void 0 ? bands : getDesiredTicks(subtype, angleStart, angleEnd),
    }).ticks();
    var aboveBaseCount = finalBands.filter(function (b) { return b > base; }).length;
    var belowBaseCount = finalBands.filter(function (b) { return b <= base; }).length;
    var callbackArgs = {
        base: base,
        target: target,
        actual: actual,
        highestValue: highestValue,
        lowestValue: lowestValue,
        aboveBaseCount: aboveBaseCount,
        belowBaseCount: belowBaseCount,
    };
    var bulletViewModel = {
        subtype: subtype,
        base: base,
        target: target,
        actual: actual,
        bands: finalBands.map(function (value, index) { return ({
            value: value,
            fillColor: bandFillColor(__assign({ value: value, index: index }, callbackArgs)),
            text: bandLabels,
        }); }),
        ticks: finalTicks.map(function (value, index) { return ({
            value: value,
            text: tickValueFormatter(__assign({ value: value, index: index }, callbackArgs)),
        }); }),
        labelMajor: typeof labelMajor === 'string' ? labelMajor : labelMajor(__assign({ value: NaN, index: 0 }, callbackArgs)),
        labelMinor: typeof labelMinor === 'string' ? labelMinor : labelMinor(__assign({ value: NaN, index: 0 }, callbackArgs)),
        centralMajor: typeof centralMajor === 'string' ? centralMajor : centralMajor(__assign({ value: NaN, index: 0 }, callbackArgs)),
        centralMinor: typeof centralMinor === 'string' ? centralMinor : centralMinor(__assign({ value: NaN, index: 0 }, callbackArgs)),
        highestValue: highestValue,
        lowestValue: lowestValue,
        aboveBaseCount: aboveBaseCount,
        belowBaseCount: belowBaseCount,
        angleStart: angleStart,
        angleEnd: angleEnd,
        tooltipValueFormatter: function () { return ''; },
    };
    var pickQuads = function (x, y) {
        return -innerWidth / 2 <= x && x <= innerWidth / 2 && -innerHeight / 2 <= y && y <= innerHeight / 2
            ? [bulletViewModel]
            : [];
    };
    return {
        theme: theme.goal,
        chartCenter: chartCenter,
        bulletViewModel: bulletViewModel,
        pickQuads: pickQuads,
    };
}
exports.shapeViewModel = shapeViewModel;
function getDesiredTicks(subtype, angleStart, angleEnd) {
    if (subtype !== constants_1.GoalSubtype.Goal)
        return 5;
    var arc = Math.abs(angleStart - angleEnd);
    return Math.ceil(arc / (Math.PI / 4));
}
//# sourceMappingURL=viewmodel.js.map