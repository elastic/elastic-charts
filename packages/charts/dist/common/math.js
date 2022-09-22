"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extent = exports.logarithm = void 0;
function logarithm(base, y) {
    return Math.log(y) / Math.log(base);
}
exports.logarithm = logarithm;
function extent(array) {
    var len = array.length;
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < len; i += 1) {
        var value = array[i];
        if (min > value)
            min = value;
        if (max < value)
            max = value;
    }
    return [min, max];
}
exports.extent = extent;
//# sourceMappingURL=math.js.map