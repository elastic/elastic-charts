"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinSagitta = exports.getSagitta = exports.normalizeAngles = exports.getTransformDirection = void 0;
const constants_1 = require("../../../../common/constants");
const common_1 = require("../../../../utils/common");
const LIMITING_ANGLE = Math.PI / 2;
const hasTopGap = (angleStart, angleEnd) => {
    const [a, b] = [angleStart, angleEnd].sort();
    return a <= -Math.PI / 2 && a >= (-Math.PI * 3) / 2 && b >= -Math.PI / 2 && b <= Math.PI / 2;
};
const hasBottomGap = (angleStart, angleEnd) => {
    const [a, b] = [angleStart, angleEnd].sort();
    return a >= -Math.PI / 2 && a <= Math.PI / 2 && b < (Math.PI * 3) / 2 && b >= Math.PI / 2;
};
const isOnlyTopHalf = (angleStart, angleEnd) => {
    const [a, b] = [angleStart, angleEnd].sort();
    return a >= 0 && b <= Math.PI;
};
const isOnlyBottomHalf = (angleStart, angleEnd) => {
    const [a, b] = [angleStart, angleEnd].sort();
    return (a >= Math.PI && b <= 2 * Math.PI) || (a >= -Math.PI && b <= 0);
};
const isWithinLimitedDomain = (angleStart, angleEnd) => {
    const [a, b] = [angleStart, angleEnd].sort();
    return a > -2 * Math.PI && b < 2 * Math.PI;
};
const getTransformDirection = (angleStart, angleEnd) => hasTopGap(angleStart, angleEnd) || isOnlyBottomHalf(angleStart, angleEnd) ? -1 : 1;
exports.getTransformDirection = getTransformDirection;
const controllingAngle = (angleStart, angleEnd) => {
    if (!isWithinLimitedDomain(angleStart, angleEnd))
        return LIMITING_ANGLE * 2;
    if (isOnlyTopHalf(angleStart, angleEnd) || isOnlyBottomHalf(angleStart, angleEnd))
        return LIMITING_ANGLE;
    if (!hasTopGap(angleStart, angleEnd) && !hasBottomGap(angleStart, angleEnd))
        return LIMITING_ANGLE * 2;
    const offset = hasBottomGap(angleStart, angleEnd) ? -Math.PI / 2 : Math.PI / 2;
    return Math.max(Math.abs(angleStart + offset), Math.abs(angleEnd + offset), LIMITING_ANGLE);
};
function normalizeAngles(angleStart, angleEnd) {
    const maxOffset = Math.max(Math.ceil(Math.abs(angleStart) / constants_1.TAU), Math.ceil(Math.abs(angleEnd) / constants_1.TAU)) - 1;
    const offsetDirection = angleStart > 0 && angleEnd > 0 ? -1 : 1;
    const offset = offsetDirection * maxOffset * constants_1.TAU;
    return [angleStart + offset, angleEnd + offset];
}
exports.normalizeAngles = normalizeAngles;
function getSagitta(angle, radius, fractionDigits = 1) {
    const arcLength = angle * radius;
    const halfCord = radius * Math.sin(arcLength / (2 * radius));
    const lengthMiltiplier = arcLength > Math.PI ? 1 : -1;
    const sagitta = radius + lengthMiltiplier * Math.sqrt(Math.pow(radius, 2) - Math.pow(halfCord, 2));
    return (0, common_1.round)(sagitta, fractionDigits);
}
exports.getSagitta = getSagitta;
function getMinSagitta(angleStart, angleEnd, radius, fractionDigits) {
    const normalizedAngles = normalizeAngles(angleStart, angleEnd);
    const limitingAngle = controllingAngle(...normalizedAngles);
    return getSagitta(limitingAngle * 2, radius, fractionDigits);
}
exports.getMinSagitta = getMinSagitta;
//# sourceMappingURL=utils.js.map