"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad = exports.horizontalPad = exports.verticalPad = exports.outerPad = exports.innerPad = void 0;
var innerPad = function (padding, minPadding) {
    var _a;
    if (minPadding === void 0) { minPadding = 0; }
    return Math.max(minPadding, typeof padding === 'number' ? padding : (_a = padding === null || padding === void 0 ? void 0 : padding.inner) !== null && _a !== void 0 ? _a : 0);
};
exports.innerPad = innerPad;
var outerPad = function (padding, minPadding) {
    var _a;
    if (minPadding === void 0) { minPadding = 0; }
    return Math.max(minPadding, typeof padding === 'number' ? padding : (_a = padding === null || padding === void 0 ? void 0 : padding.outer) !== null && _a !== void 0 ? _a : 0);
};
exports.outerPad = outerPad;
var verticalPad = function (padding, minPadding) {
    if (minPadding === void 0) { minPadding = 0; }
    return Math.max(minPadding, typeof padding === 'number' ? padding * 2 : padding.top + padding.bottom);
};
exports.verticalPad = verticalPad;
var horizontalPad = function (padding, minPadding) {
    if (minPadding === void 0) { minPadding = 0; }
    return Math.max(minPadding, typeof padding === 'number' ? padding * 2 : padding.left + padding.right);
};
exports.horizontalPad = horizontalPad;
var pad = function (padding, direction, minPadding) {
    if (minPadding === void 0) { minPadding = 0; }
    return Math.max(minPadding, typeof padding === 'number' ? padding : padding[direction]);
};
exports.pad = pad;
//# sourceMappingURL=dimensions.js.map