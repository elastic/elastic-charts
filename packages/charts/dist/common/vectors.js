"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sub2 = exports.rotate2 = void 0;
function rotate2(radian, vector) {
    return [
        Math.cos(radian) * vector[0] - Math.sin(radian) * vector[1],
        Math.sin(radian) * vector[0] + Math.cos(radian) * vector[1],
    ];
}
exports.rotate2 = rotate2;
function sub2(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}
exports.sub2 = sub2;
//# sourceMappingURL=vectors.js.map