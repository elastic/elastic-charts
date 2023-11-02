"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitClamp = exports.clamp = exports.mix = void 0;
const mix = (start, end, a) => start * (1 - a) + end * a;
exports.mix = mix;
const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);
exports.clamp = clamp;
const unitClamp = (n) => (n <= 0 ? 0 : n >= 1 ? 1 : n);
exports.unitClamp = unitClamp;
//# sourceMappingURL=math.js.map