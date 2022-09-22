"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axisScale = exports.getDesiredTickCount = void 0;
var getDesiredTickCount = function (cartesianHeight, fontSize, sparse) {
    var desiredMaxTickCount = Math.floor(cartesianHeight / (3 * fontSize));
    return sparse ? 1 + Math.ceil(Math.pow(desiredMaxTickCount, 0.25)) : 1 + Math.ceil(Math.sqrt(desiredMaxTickCount));
};
exports.getDesiredTickCount = getDesiredTickCount;
var axisScale = function (niceDomainMin, niceDomainMax) {
    var niceDomainExtent = niceDomainMax - niceDomainMin;
    var yScaleMultiplier = 1 / (niceDomainExtent || 1);
    var offset = -niceDomainMin * yScaleMultiplier;
    return function (d) { return offset + d * yScaleMultiplier; };
};
exports.axisScale = axisScale;
//# sourceMappingURL=projection.js.map