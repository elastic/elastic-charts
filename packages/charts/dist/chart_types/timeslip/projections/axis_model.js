"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axisModel = exports.getDecimalTicks = exports.oneFive = exports.oneTwoFive = void 0;
const common_1 = require("../../../utils/common");
const oneTwoFive = (mantissa) => (mantissa > 5 ? 10 : mantissa > 2 ? 5 : mantissa > 1 ? 2 : 1);
exports.oneTwoFive = oneTwoFive;
const oneFive = (mantissa) => (mantissa > 5 ? 10 : mantissa > 1 ? 5 : 1);
exports.oneFive = oneFive;
const getNiceTicksForApproxCount = (domainMin, domainMax, approxDesiredTickCount, mantissaFun = exports.oneTwoFive) => {
    const diff = domainMax - domainMin;
    const rawPitch = diff / approxDesiredTickCount;
    const exponent = Math.floor(Math.log10(rawPitch));
    const orderOfMagnitude = 10 ** exponent;
    const mantissa = rawPitch / orderOfMagnitude;
    const niceMantissa = mantissaFun(mantissa);
    const tickInterval = niceMantissa * orderOfMagnitude;
    if (!isFinite(tickInterval)) {
        return [];
    }
    const result = [];
    for (let i = Math.floor(domainMin / tickInterval); i <= Math.ceil(domainMax / tickInterval); i++) {
        result.push(i * tickInterval);
    }
    return result;
};
const getDecimalTicks = (domainMin, domainMax, maximumTickCount, mantissaFun = exports.oneTwoFive) => {
    var _a;
    let bestCandidate = [];
    for (let i = 0; i <= maximumTickCount; i++) {
        const candidate = getNiceTicksForApproxCount(domainMin, domainMax, maximumTickCount - i, mantissaFun);
        if (candidate.length <= maximumTickCount && candidate.length > 0)
            return candidate;
        if (bestCandidate.length === 0 || maximumTickCount - candidate.length < maximumTickCount - bestCandidate.length) {
            bestCandidate = candidate;
        }
    }
    return bestCandidate.length > maximumTickCount
        ? [...(maximumTickCount > 1 && (0, common_1.isDefined)(bestCandidate[0]) ? [bestCandidate[0]] : []), (_a = bestCandidate.at(-1)) !== null && _a !== void 0 ? _a : NaN]
        : [];
};
exports.getDecimalTicks = getDecimalTicks;
const axisModel = (domainLandmarks, desiredTickCount) => {
    const domainMin = Math.min(...domainLandmarks);
    const domainMax = Math.max(...domainLandmarks);
    const niceTicks = (0, exports.getDecimalTicks)(domainMin, domainMax, desiredTickCount);
    const niceDomainMin = niceTicks.length >= 2 ? niceTicks[0] : domainMin;
    const niceDomainMax = niceTicks.length >= 2 ? niceTicks.at(-1) : domainMax;
    return { niceDomainMin, niceDomainMax, niceTicks };
};
exports.axisModel = axisModel;
//# sourceMappingURL=axis_model.js.map