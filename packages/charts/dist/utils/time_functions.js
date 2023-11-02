"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimingFunctions = exports.TimeFunction = void 0;
const bezier_easing_1 = __importDefault(require("bezier-easing"));
exports.TimeFunction = Object.freeze({
    linear: 'linear',
    ease: 'ease',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
});
const getBezierFn = (x1, y1, x2, y2) => {
    const fn = (0, bezier_easing_1.default)(x1, y1, x2, y2);
    fn.inverse = (0, bezier_easing_1.default)(y1, x1, y2, x2);
    return fn;
};
const linear = ((t) => t);
linear.inverse = (n) => n;
exports.TimingFunctions = {
    linear,
    ease: getBezierFn(0.25, 0.1, 0.25, 1.0),
    easeIn: getBezierFn(0.42, 0.0, 1.0, 1.0),
    easeOut: getBezierFn(0.0, 0.0, 0.58, 1.0),
    easeInOut: getBezierFn(0.42, 0.0, 0.58, 1.0),
};
//# sourceMappingURL=time_functions.js.map