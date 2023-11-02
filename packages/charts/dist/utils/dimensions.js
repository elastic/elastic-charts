"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad = exports.horizontalPad = exports.verticalPad = exports.outerPad = exports.innerPad = void 0;
const innerPad = (padding, minPadding = 0) => { var _a; return Math.max(minPadding, typeof padding === 'number' ? padding : (_a = padding === null || padding === void 0 ? void 0 : padding.inner) !== null && _a !== void 0 ? _a : 0); };
exports.innerPad = innerPad;
const outerPad = (padding, minPadding = 0) => { var _a; return Math.max(minPadding, typeof padding === 'number' ? padding : (_a = padding === null || padding === void 0 ? void 0 : padding.outer) !== null && _a !== void 0 ? _a : 0); };
exports.outerPad = outerPad;
const verticalPad = (padding, minPadding = 0) => Math.max(minPadding, typeof padding === 'number' ? padding * 2 : padding.top + padding.bottom);
exports.verticalPad = verticalPad;
const horizontalPad = (padding, minPadding = 0) => Math.max(minPadding, typeof padding === 'number' ? padding * 2 : padding.left + padding.right);
exports.horizontalPad = horizontalPad;
const pad = (padding, direction, minPadding = 0) => Math.max(minPadding, typeof padding === 'number' ? padding : padding[direction]);
exports.pad = pad;
//# sourceMappingURL=dimensions.js.map