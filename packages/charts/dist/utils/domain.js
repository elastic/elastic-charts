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
exports.computeContinuousDataDomain = exports.computeDomainExtent = exports.computeOrdinalDataDomain = void 0;
var d3_array_1 = require("d3-array");
var constants_1 = require("../scales/constants");
var specs_1 = require("../specs");
function constrainPadding(start, end, newStart, newEnd, constrain) {
    if (constrain === void 0) { constrain = true; }
    return constrain
        ? start < end
            ? [newStart >= 0 || start < 0 ? newStart : 0, newEnd <= 0 || end > 0 ? newEnd : 0]
            : [newEnd >= 0 || end < 0 ? newEnd : 0, newStart <= 0 || start > 0 ? newStart : 0]
        : [newStart, newEnd];
}
function computeOrdinalDataDomain(data, sorted, removeNull) {
    var uniqueValues = __spreadArray([], __read(new Set(removeNull ? data.filter(function (d) { return d !== null; }) : data)), false);
    return sorted ? uniqueValues.sort(function (a, b) { return "".concat(a).localeCompare("".concat(b)); }) : uniqueValues;
}
exports.computeOrdinalDataDomain = computeOrdinalDataDomain;
function getPaddedDomain(start, end, domainOptions) {
    var padding = domainOptions.padding, _a = domainOptions.paddingUnit, paddingUnit = _a === void 0 ? specs_1.DomainPaddingUnit.Domain : _a;
    if (!padding || paddingUnit === specs_1.DomainPaddingUnit.Pixel)
        return [start, end];
    var computedPadding = Math.abs(padding * (paddingUnit === specs_1.DomainPaddingUnit.Domain ? 1 : end - start));
    return constrainPadding(start, end, start - computedPadding, end + computedPadding, domainOptions.constrainPadding);
}
function computeDomainExtent(domain, domainOptions) {
    if (domain[0] === undefined)
        return [0, 0];
    var inverted = domain[0] > domain[1];
    var paddedDomain = (function (_a) {
        var _b = __read(_a, 2), start = _b[0], end = _b[1];
        var _c = __read(getPaddedDomain(start, end, domainOptions), 2), paddedStart = _c[0], paddedEnd = _c[1];
        if (paddedStart >= 0 && paddedEnd >= 0)
            return domainOptions.fit ? [paddedStart, paddedEnd] : [0, paddedEnd];
        if (paddedStart < 0 && paddedEnd < 0)
            return domainOptions.fit ? [paddedStart, paddedEnd] : [paddedStart, 0];
        return [paddedStart, paddedEnd];
    })(inverted ? [domain[1], domain[0]] : domain);
    return inverted ? [paddedDomain[1], paddedDomain[0]] : paddedDomain;
}
exports.computeDomainExtent = computeDomainExtent;
function computeContinuousDataDomain(data, scaleType, domainOptions) {
    var _a, _b;
    var filteredData = (domainOptions === null || domainOptions === void 0 ? void 0 : domainOptions.fit) && scaleType === constants_1.ScaleType.Log ? data.filter(function (d) { return d !== 0; }) : data;
    var range = (0, d3_array_1.extent)(filteredData, function (d) { return d; });
    return domainOptions === undefined ? [(_a = range[0]) !== null && _a !== void 0 ? _a : 0, (_b = range[1]) !== null && _b !== void 0 ? _b : 0] : computeDomainExtent(range, domainOptions);
}
exports.computeContinuousDataDomain = computeContinuousDataDomain;
//# sourceMappingURL=domain.js.map