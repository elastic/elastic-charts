"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zeroTouch = exports.twoTouchPinch = exports.getPinchRatio = exports.eraseMultitouch = exports.setNewMultitouch = exports.continuedTwoPointTouch = exports.touches = exports.touchMidpoint = exports.initialMultitouch = void 0;
const initialMultitouch = () => [];
exports.initialMultitouch = initialMultitouch;
const touchMidpoint = (multitouch) => multitouch.reduce((sum, { position }) => sum + position, 0) / multitouch.length;
exports.touchMidpoint = touchMidpoint;
const isNonNull = (thing) => thing !== null;
const touches = (e) => {
    var _a, _b;
    return [...new Array((_b = (_a = e.touches) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0)]
        .map((_, i) => e.touches.item(i))
        .filter(isNonNull)
        .map((t) => ({ id: t.identifier, position: t.clientX }))
        .sort(({ position: a }, { position: b }) => a - b);
};
exports.touches = touches;
const continuedTwoPointTouch = (multitouch, newMultitouch) => [...newMultitouch, ...multitouch].filter((t, i, a) => a.findIndex((tt) => tt.id === t.id) === i).length === 2;
exports.continuedTwoPointTouch = continuedTwoPointTouch;
const setNewMultitouch = (multitouch, newMultitouch) => multitouch.splice(0, Infinity, ...newMultitouch);
exports.setNewMultitouch = setNewMultitouch;
const eraseMultitouch = (multitouch) => multitouch.splice(0, Infinity);
exports.eraseMultitouch = eraseMultitouch;
const getPinchRatio = (multitouch, newMultitouch) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return (((_b = (_a = multitouch[1]) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : NaN - ((_d = (_c = multitouch[0]) === null || _c === void 0 ? void 0 : _c.position) !== null && _d !== void 0 ? _d : NaN)) /
        (((_f = (_e = newMultitouch[1]) === null || _e === void 0 ? void 0 : _e.position) !== null && _f !== void 0 ? _f : NaN) - ((_h = (_g = newMultitouch[0]) === null || _g === void 0 ? void 0 : _g.position) !== null && _h !== void 0 ? _h : NaN)));
};
exports.getPinchRatio = getPinchRatio;
const twoTouchPinch = (multitouch) => multitouch.length === 2;
exports.twoTouchPinch = twoTouchPinch;
const zeroTouch = (multitouch) => multitouch.length === 0;
exports.zeroTouch = zeroTouch;
//# sourceMappingURL=multitouch.js.map