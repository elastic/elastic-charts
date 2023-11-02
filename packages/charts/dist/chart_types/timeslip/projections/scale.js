"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLinearScale = exports.getDesiredTickCount = void 0;
const getDesiredTickCount = (cartesianHeight, fontSize, sparse) => {
    const desiredMaxTickCount = Math.floor(cartesianHeight / (3 * fontSize));
    return sparse ? 1 + Math.ceil(Math.pow(desiredMaxTickCount, 0.25)) : 1 + Math.ceil(Math.sqrt(desiredMaxTickCount));
};
exports.getDesiredTickCount = getDesiredTickCount;
const makeLinearScale = (domainFrom, domainTo, rangeFrom, rangeTo) => {
    const domainExtent = domainTo - domainFrom;
    const rangeExtent = rangeTo - rangeFrom;
    const scale = rangeExtent / domainExtent;
    const offset = rangeFrom - scale * domainFrom;
    return (d) => offset + scale * d;
};
exports.makeLinearScale = makeLinearScale;
//# sourceMappingURL=scale.js.map