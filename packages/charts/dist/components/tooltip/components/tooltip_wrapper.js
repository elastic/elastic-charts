"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipWrapper = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var common_1 = require("../../../utils/common");
var tooltip_provider_1 = require("./tooltip_provider");
var TooltipWrapper = function (_a) {
    var children = _a.children, _b = _a.actions, actions = _b === void 0 ? [] : _b, actionPrompt = _a.actionPrompt, selectionPrompt = _a.selectionPrompt, className = _a.className;
    var _c = (0, tooltip_provider_1.useTooltipContext)(), dir = _c.dir, pinned = _c.pinned, selected = _c.selected, onTooltipPinned = _c.onTooltipPinned;
    var renderActions = function () {
        var visibleActions = actions.filter(function (_a) {
            var hide = _a.hide;
            return !hide || hide(selected);
        });
        if (visibleActions.length === 0) {
            return react_1.default.createElement("div", { className: "echTooltip__prompt" }, selectionPrompt);
        }
        return visibleActions.map(function (_a, i) {
            var onSelect = _a.onSelect, label = _a.label, disabled = _a.disabled;
            var reason = disabled && disabled(selected);
            return (react_1.default.createElement("button", { className: "echTooltip__action", key: i, title: typeof reason === 'string' ? reason : undefined, disabled: Boolean(reason), onClick: function () {
                    onTooltipPinned(false, true);
                    setTimeout(onSelect, 0, selected);
                } }, label(selected)));
        });
    };
    return (react_1.default.createElement("div", { className: (0, classnames_1.default)('echTooltip', className, {
            'echTooltip--pinned': pinned,
        }), dir: dir, onClick: function (e) {
            e.stopPropagation();
        } },
        (0, common_1.renderComplexChildren)(children),
        actions.length > 0 && (react_1.default.createElement("div", { className: "echTooltip__actions" }, pinned ? renderActions() : react_1.default.createElement("div", { className: "echTooltip__prompt" }, actionPrompt)))));
};
exports.TooltipWrapper = TooltipWrapper;
//# sourceMappingURL=tooltip_wrapper.js.map