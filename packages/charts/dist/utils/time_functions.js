"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimingFunctions = exports.TimeFunction = void 0;
var bezier_easing_1 = __importDefault(require("bezier-easing"));
exports.TimeFunction = Object.freeze({
    linear: 'linear',
    ease: 'ease',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
});
var getBezierFn = function (x1, y1, x2, y2) {
    var fn = (0, bezier_easing_1.default)(x1, y1, x2, y2);
    fn.inverse = (0, bezier_easing_1.default)(y1, x1, y2, x2);
    return fn;
};
var linear = (function (t) { return t; });
linear.inverse = function (n) { return n; };
exports.TimingFunctions = {
    linear: linear,
    ease: getBezierFn(0.25, 0.1, 0.25, 1.0),
    easeIn: getBezierFn(0.42, 0.0, 1.0, 1.0),
    easeOut: getBezierFn(0.0, 0.0, 0.58, 1.0),
    easeInOut: getBezierFn(0.42, 0.0, 0.58, 1.0),
};
//# sourceMappingURL=time_functions.js.map