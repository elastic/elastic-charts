"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipPrompt = void 0;
const react_1 = __importDefault(require("react"));
const tooltip_divider_1 = require("./tooltip_divider");
function TooltipPrompt({ children }) {
    return (react_1.default.createElement("div", { className: "echTooltipPrompt slideDown", key: Math.random() },
        react_1.default.createElement(tooltip_divider_1.TooltipDivider, null),
        react_1.default.createElement("div", { className: "echTooltipPrompt__content" }, children)));
}
exports.TooltipPrompt = TooltipPrompt;
//# sourceMappingURL=tooltip_prompt.js.map