"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeContinuousDataDomain = exports.computeDomainExtent = exports.computeOrdinalDataDomain = void 0;
const d3_array_1 = require("d3-array");
const constants_1 = require("../scales/constants");
const specs_1 = require("../specs");
function constrainPadding(start, end, newStart, newEnd, constrain = true) {
    return constrain
        ? start < end
            ? [newStart >= 0 || start < 0 ? newStart : 0, newEnd <= 0 || end > 0 ? newEnd : 0]
            : [newEnd >= 0 || end < 0 ? newEnd : 0, newStart <= 0 || start > 0 ? newStart : 0]
        : [newStart, newEnd];
}
function computeOrdinalDataDomain(data, sorted, removeNull, locale) {
    const uniqueValues = [...new Set(removeNull ? data.filter((d) => d !== null) : data)];
    return sorted ? uniqueValues.sort((a, b) => `${a}`.localeCompare(`${b}`, locale)) : uniqueValues;
}
exports.computeOrdinalDataDomain = computeOrdinalDataDomain;
function getPaddedDomain(start, end, domainOptions) {
    const { padding, paddingUnit = specs_1.DomainPaddingUnit.Domain } = domainOptions;
    if (!padding || paddingUnit === specs_1.DomainPaddingUnit.Pixel)
        return [start, end];
    const computedPadding = Math.abs(padding * (paddingUnit === specs_1.DomainPaddingUnit.Domain ? 1 : end - start));
    return constrainPadding(start, end, start - computedPadding, end + computedPadding, domainOptions.constrainPadding);
}
function computeDomainExtent(domain, domainOptions) {
    if (domain[0] === undefined)
        return [0, 0];
    const inverted = domain[0] > domain[1];
    const paddedDomain = (([start, end]) => {
        const [paddedStart, paddedEnd] = getPaddedDomain(start, end, domainOptions);
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
    const filteredData = (domainOptions === null || domainOptions === void 0 ? void 0 : domainOptions.fit) && scaleType === constants_1.ScaleType.Log ? data.filter((d) => d !== 0) : data;
    const range = (0, d3_array_1.extent)(filteredData, (d) => d);
    return domainOptions === undefined ? [(_a = range[0]) !== null && _a !== void 0 ? _a : 0, (_b = range[1]) !== null && _b !== void 0 ? _b : 0] : computeDomainExtent(range, domainOptions);
}
exports.computeContinuousDataDomain = computeContinuousDataDomain;
//# sourceMappingURL=domain.js.map