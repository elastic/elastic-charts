"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureRendererFn = exports.ShapeRendererFn = void 0;
var common_1 = require("../../../utils/common");
var theme_1 = require("../../../utils/themes/theme");
var cross = function (r) {
    return "M ".concat(-r, " 0 L ").concat(r, " 0 M 0 ").concat(r, " L 0 ").concat(-r);
};
var triangle = function (r) {
    var h = (r * Math.sqrt(3)) / 2;
    var hr = r / 2;
    return "M ".concat(-h, " ").concat(hr, " L ").concat(h, " ").concat(hr, " L 0 ").concat(-r, " Z");
};
var square = function (rotation) {
    if (rotation === void 0) { rotation = 0; }
    return function (r) {
        var d = (0, common_1.degToRad)(rotation);
        var s = Math.abs(Math.cos(d) + Math.sin(d));
        var sr = s > 0 ? r / s : r;
        return "M ".concat(-sr, " ").concat(-sr, " L ").concat(-sr, " ").concat(sr, " L ").concat(sr, " ").concat(sr, " L ").concat(sr, " ").concat(-sr, " Z");
    };
};
var circle = function (r) {
    return "M ".concat(-r, " 0 a ").concat(r, ",").concat(r, " 0 1,0 ").concat(r * 2, ",0 a ").concat(r, ",").concat(r, " 0 1,0 ").concat(-r * 2, ",0");
};
var line = function (r) {
    return "M 0 ".concat(-r, " l 0 ").concat(r * 2);
};
exports.ShapeRendererFn = (_a = {},
    _a[theme_1.PointShape.Circle] = [circle, 0],
    _a[theme_1.PointShape.X] = [cross, 45],
    _a[theme_1.PointShape.Plus] = [cross, 0],
    _a[theme_1.PointShape.Diamond] = [square(45), 45],
    _a[theme_1.PointShape.Square] = [square(0), 0],
    _a[theme_1.PointShape.Triangle] = [triangle, 0],
    _a);
exports.TextureRendererFn = __assign(__assign({}, exports.ShapeRendererFn), (_b = {}, _b[theme_1.TextureShape.Line] = [line, 0], _b));
//# sourceMappingURL=shapes_paths.js.map