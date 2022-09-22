"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderExtra = void 0;
var react_1 = __importDefault(require("react"));
function renderExtra(extra) {
    return (react_1.default.createElement("div", { className: "echLegendItem__extra", title: "".concat(extra) }, extra));
}
exports.renderExtra = renderExtra;
//# sourceMappingURL=extra.js.map