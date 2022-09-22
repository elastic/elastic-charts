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
exports.getMinSagitta = exports.getSagitta = exports.normalizeAngles = exports.getTranformDirection = void 0;
var constants_1 = require("../../../../common/constants");
var common_1 = require("../../../../utils/common");
var LIMITING_ANGLE = Math.PI / 2;
var hasTopGap = function (angleStart, angleEnd) {
    var _a = __read([angleStart, angleEnd].sort(), 2), a = _a[0], b = _a[1];
    return a <= -Math.PI / 2 && a >= (-Math.PI * 3) / 2 && b >= -Math.PI / 2 && b <= Math.PI / 2;
};
var hasBottomGap = function (angleStart, angleEnd) {
    var _a = __read([angleStart, angleEnd].sort(), 2), a = _a[0], b = _a[1];
    return a >= -Math.PI / 2 && a <= Math.PI / 2 && b < (Math.PI * 3) / 2 && b >= Math.PI / 2;
};
var isOnlyTopHalf = function (angleStart, angleEnd) {
    var _a = __read([angleStart, angleEnd].sort(), 2), a = _a[0], b = _a[1];
    return a >= 0 && b <= Math.PI;
};
var isOnlyBottomHalf = function (angleStart, angleEnd) {
    var _a = __read([angleStart, angleEnd].sort(), 2), a = _a[0], b = _a[1];
    return (a >= Math.PI && b <= 2 * Math.PI) || (a >= -Math.PI && b <= 0);
};
var isWithinLimitedDomain = function (angleStart, angleEnd) {
    var _a = __read([angleStart, angleEnd].sort(), 2), a = _a[0], b = _a[1];
    return a > -2 * Math.PI && b < 2 * Math.PI;
};
var getTranformDirection = function (angleStart, angleEnd) {
    return hasTopGap(angleStart, angleEnd) || isOnlyBottomHalf(angleStart, angleEnd) ? -1 : 1;
};
exports.getTranformDirection = getTranformDirection;
var controllingAngle = function (angleStart, angleEnd) {
    if (!isWithinLimitedDomain(angleStart, angleEnd))
        return LIMITING_ANGLE * 2;
    if (isOnlyTopHalf(angleStart, angleEnd) || isOnlyBottomHalf(angleStart, angleEnd))
        return LIMITING_ANGLE;
    if (!hasTopGap(angleStart, angleEnd) && !hasBottomGap(angleStart, angleEnd))
        return LIMITING_ANGLE * 2;
    var offset = hasBottomGap(angleStart, angleEnd) ? -Math.PI / 2 : Math.PI / 2;
    return Math.max(Math.abs(angleStart + offset), Math.abs(angleEnd + offset), LIMITING_ANGLE);
};
function normalizeAngles(angleStart, angleEnd) {
    var maxOffset = Math.max(Math.ceil(Math.abs(angleStart) / constants_1.TAU), Math.ceil(Math.abs(angleEnd) / constants_1.TAU)) - 1;
    var offsetDirection = angleStart > 0 && angleEnd > 0 ? -1 : 1;
    var offset = offsetDirection * maxOffset * constants_1.TAU;
    return [angleStart + offset, angleEnd + offset];
}
exports.normalizeAngles = normalizeAngles;
function getSagitta(angle, radius, fractionDigits) {
    if (fractionDigits === void 0) { fractionDigits = 1; }
    var arcLength = angle * radius;
    var halfCord = radius * Math.sin(arcLength / (2 * radius));
    var lengthMiltiplier = arcLength > Math.PI ? 1 : -1;
    var sagitta = radius + lengthMiltiplier * Math.sqrt(Math.pow(radius, 2) - Math.pow(halfCord, 2));
    return (0, common_1.round)(sagitta, fractionDigits);
}
exports.getSagitta = getSagitta;
function getMinSagitta(angleStart, angleEnd, radius, fractionDigits) {
    var normalizedAngles = normalizeAngles(angleStart, angleEnd);
    var limitingAngle = controllingAngle.apply(void 0, __spreadArray([], __read(normalizedAngles), false));
    return getSagitta(limitingAngle * 2, radius, fractionDigits);
}
exports.getMinSagitta = getMinSagitta;
//# sourceMappingURL=utils.js.map