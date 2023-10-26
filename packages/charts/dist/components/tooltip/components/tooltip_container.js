"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipContainer = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const tooltip_provider_1 = require("./tooltip_provider");
const common_1 = require("../../../utils/common");
const TooltipContainer = (props) => {
    const { pinned } = (0, tooltip_provider_1.useTooltipContext)();
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('echTooltip', props.className, { 'echTooltip--pinned': pinned }) }, (0, common_1.renderComplexChildren)(props.children)));
};
exports.TooltipContainer = TooltipContainer;
//# sourceMappingURL=tooltip_container.js.map