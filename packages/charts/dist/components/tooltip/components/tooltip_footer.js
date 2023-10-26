"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipFooter = void 0;
const react_1 = __importDefault(require("react"));
const common_1 = require("../../../utils/common");
const TooltipFooter = ({ children }) => {
    return react_1.default.createElement("div", { className: "echTooltipFooter" }, (0, common_1.renderComplexChildren)(children));
};
exports.TooltipFooter = TooltipFooter;
//# sourceMappingURL=tooltip_footer.js.map