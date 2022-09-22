"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitClamp = exports.clamp = exports.mix = void 0;
var mix = function (start, end, a) { return start * (1 - a) + end * a; };
exports.mix = mix;
var clamp = function (n, lo, hi) { return (n < lo ? lo : n > hi ? hi : n); };
exports.clamp = clamp;
var unitClamp = function (n) { return (n < 0 ? 0 : n > 1 ? 1 : n); };
exports.unitClamp = unitClamp;
//# sourceMappingURL=math.js.map