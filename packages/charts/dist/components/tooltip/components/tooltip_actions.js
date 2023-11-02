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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipActions = void 0;
const react_1 = __importStar(require("react"));
const tooltip_divider_1 = require("./tooltip_divider");
const tooltip_provider_1 = require("./tooltip_provider");
const common_1 = require("../../../utils/common");
const TooltipActions = ({ actions, selectionPrompt, actionsLoading, noActionsLoaded, }) => {
    const { pinned, selected, values, pinTooltip } = (0, tooltip_provider_1.useTooltipContext)();
    const syncActions = Array.isArray(actions);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [loadedActions, setLoadedActions] = (0, react_1.useState)(syncActions ? actions : []);
    (0, react_1.useEffect)(() => {
        if (pinned && !syncActions) {
            const fetchActions = async (asyncActions) => {
                setLoading(true);
                setLoadedActions(await asyncActions(selected));
                setLoading(false);
            };
            void fetchActions(actions);
            return () => {
                setLoading(true);
                setLoadedActions([]);
            };
        }
    }, [syncActions, actions, selected, pinned]);
    if (!syncActions) {
        if (loading)
            return renderPromptContent(actionsLoading, selected);
        if (loadedActions.length === 0)
            return renderPromptContent(noActionsLoaded, selected);
    }
    if (pinned && syncActions && loadedActions.length === 0) {
        return null;
    }
    const visibleActions = loadedActions.filter(({ hide }) => !hide || hide(selected, values));
    if (visibleActions.length === 0) {
        return renderPromptContent(selectionPrompt, selected);
    }
    return (react_1.default.createElement("div", { className: "echTooltipActions" },
        react_1.default.createElement(tooltip_divider_1.TooltipDivider, null),
        ...visibleActions.map(({ onSelect, label, disabled }, i) => {
            const reason = disabled && disabled(selected, values);
            return (react_1.default.createElement("button", { className: "echTooltipActions__action", key: `${i}`, title: typeof reason === 'string' ? reason : undefined, disabled: Boolean(reason), onClick: () => {
                    pinTooltip(false, true);
                    setTimeout(() => {
                        onSelect(selected, values);
                    }, 0);
                } }, typeof label === 'string' ? label : label(selected, values)));
        })));
};
exports.TooltipActions = TooltipActions;
function renderPromptContent(content, selected) {
    return (react_1.default.createElement("div", { className: "echTooltipActions" },
        react_1.default.createElement(tooltip_divider_1.TooltipDivider, null),
        react_1.default.createElement("div", { className: "echTooltipActions__prompt" }, (0, common_1.renderWithProps)(content, { selected }))));
}
//# sourceMappingURL=tooltip_actions.js.map