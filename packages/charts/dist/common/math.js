"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extent = exports.logarithm = void 0;
function logarithm(base, y) {
    return Math.log(y) / Math.log(base);
}
exports.logarithm = logarithm;
function extent(array) {
    var _a;
    const len = array.length;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < len; i += 1) {
        const value = (_a = array[i]) !== null && _a !== void 0 ? _a : NaN;
        if (min > value)
            min = value;
        if (max < value)
            max = value;
    }
    return [min, max];
}
exports.extent = extent;
//# sourceMappingURL=math.js.map