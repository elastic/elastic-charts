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
exports.axisModel = void 0;
var getNiceTicksForApproxCount = function (domainMin, domainMax, approxDesiredTickCount) {
    var diff = domainMax - domainMin;
    var rawPitch = diff / approxDesiredTickCount;
    var exponent = Math.floor(Math.log10(rawPitch));
    var orderOfMagnitude = Math.pow(10, exponent);
    var mantissa = rawPitch / orderOfMagnitude;
    var niceMantissa = mantissa > 5 ? 10 : mantissa > 2 ? 5 : mantissa > 1 ? 2 : 1;
    var tickInterval = niceMantissa * orderOfMagnitude;
    if (!isFinite(tickInterval)) {
        return [];
    }
    var result = [];
    for (var i = Math.floor(domainMin / tickInterval); i <= Math.ceil(domainMax / tickInterval); i++) {
        result.push(i * tickInterval);
    }
    return result;
};
var getNiceTicks = function (domainMin, domainMax, maximumTickCount) {
    var bestCandidate = [];
    for (var i = 0; i <= maximumTickCount; i++) {
        var candidate = getNiceTicksForApproxCount(domainMin, domainMax, maximumTickCount - i);
        if (candidate.length <= maximumTickCount && candidate.length > 0)
            return candidate;
        if (bestCandidate.length === 0 || maximumTickCount - candidate.length < maximumTickCount - bestCandidate.length) {
            bestCandidate = candidate;
        }
    }
    return bestCandidate.length > maximumTickCount
        ? __spreadArray(__spreadArray([], __read((maximumTickCount > 1 ? [bestCandidate[0]] : [])), false), [bestCandidate[bestCandidate.length - 1]], false) : [];
};
var axisModel = function (domainLandmarks, desiredTickCount) {
    var domainMin = Math.min.apply(Math, __spreadArray([], __read(domainLandmarks), false));
    var domainMax = Math.max.apply(Math, __spreadArray([], __read(domainLandmarks), false));
    var niceTicks = getNiceTicks(domainMin, domainMax, desiredTickCount);
    var niceDomainMin = niceTicks.length >= 2 ? niceTicks[0] : domainMin;
    var niceDomainMax = niceTicks.length >= 2 ? niceTicks[niceTicks.length - 1] : domainMax;
    return { niceDomainMin: niceDomainMin, niceDomainMax: niceDomainMax, niceTicks: niceTicks };
};
exports.axisModel = axisModel;
//# sourceMappingURL=axis_model.js.map