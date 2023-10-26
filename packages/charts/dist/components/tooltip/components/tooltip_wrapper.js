"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipWrapper = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importStar(require("react"));
const tooltip_actions_1 = require("./tooltip_actions");
const tooltip_prompt_1 = require("./tooltip_prompt");
const tooltip_provider_1 = require("./tooltip_provider");
const TooltipWrapper = ({ children, className, actions, actionPrompt, pinningPrompt, selectionPrompt, actionsLoading, noActionsLoaded, }) => {
    const { dir, pinned, canPinTooltip, selected, theme, actionable } = (0, tooltip_provider_1.useTooltipContext)();
    const tooltipRef = (0, react_1.useRef)(null);
    const [minWidth, setMinWidth] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        window.requestAnimationFrame(() => {
            if (tooltipRef.current) {
                const { width } = tooltipRef.current.getBoundingClientRect();
                setMinWidth(width);
            }
        });
    }, []);
    (0, react_1.useEffect)(() => {
        if (pinned && tooltipRef.current && typeof theme.maxWidth === 'number' && minWidth < theme.maxWidth) {
            const { width } = tooltipRef.current.getBoundingClientRect();
            if (width > minWidth)
                setMinWidth(width);
        }
    }, [selected, pinned, minWidth, theme.maxWidth]);
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('echTooltip', className, { 'echTooltip--pinned': pinned }), dir: dir, ref: tooltipRef, style: { minWidth }, onClick: (e) => e.stopPropagation(), onKeyPress: (e) => e.stopPropagation() },
        children,
        !canPinTooltip ? null : pinned ? (react_1.default.createElement(tooltip_actions_1.TooltipActions, { actions: actions, actionsLoading: actionsLoading, noActionsLoaded: noActionsLoaded, selectionPrompt: selectionPrompt })) : (react_1.default.createElement(tooltip_prompt_1.TooltipPrompt, null, actionable ? actionPrompt : pinningPrompt))));
};
exports.TooltipWrapper = TooltipWrapper;
//# sourceMappingURL=tooltip_wrapper.js.map