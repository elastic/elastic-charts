"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipFooter = void 0;
var react_1 = __importDefault(require("react"));
var common_1 = require("../../../utils/common");
var TooltipFooter = function (_a) {
    var children = _a.children;
    return react_1.default.createElement("div", { className: "echTooltip__footer" }, (0, common_1.renderComplexChildren)(children));
};
exports.TooltipFooter = TooltipFooter;
//# sourceMappingURL=tooltip_footer.js.map