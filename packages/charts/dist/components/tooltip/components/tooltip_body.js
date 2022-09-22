"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipBody = void 0;
var react_1 = __importDefault(require("react"));
var tooltip_footer_1 = require("./tooltip_footer");
var tooltip_header_1 = require("./tooltip_header");
var tooltip_provider_1 = require("./tooltip_provider");
var tooltip_table_1 = require("./tooltip_table");
var tooltip_wrapper_1 = require("./tooltip_wrapper");
var TooltipBody = function (_a) {
    var info = _a.info, visible = _a.visible, settings = _a.settings, headerFormatter = _a.headerFormatter, columns = _a.columns, header = _a.header, footer = _a.footer, actions = _a.actions, onSelect = _a.onSelect, actionPrompt = _a.actionPrompt, selectionPrompt = _a.selectionPrompt;
    var _b = (0, tooltip_provider_1.useTooltipContext)(), backgroundColor = _b.backgroundColor, dir = _b.dir, pinned = _b.pinned, selected = _b.selected;
    if (!info || !visible) {
        return null;
    }
    if (typeof settings !== 'string' && (settings === null || settings === void 0 ? void 0 : settings.customTooltip)) {
        var CustomTooltip = settings.customTooltip;
        return (react_1.default.createElement(tooltip_wrapper_1.TooltipWrapper, { actions: actions, actionPrompt: actionPrompt, selectionPrompt: selectionPrompt },
            react_1.default.createElement(CustomTooltip, __assign({}, info, { headerFormatter: headerFormatter, backgroundColor: backgroundColor, dir: dir }))));
    }
    return (react_1.default.createElement(tooltip_wrapper_1.TooltipWrapper, { actions: actions, actionPrompt: actionPrompt, selectionPrompt: selectionPrompt },
        header ? (react_1.default.createElement(tooltip_header_1.TooltipHeader, null, typeof header === 'string' ? header : header(info.values))) : (react_1.default.createElement(tooltip_header_1.TooltipHeader, { header: info.header, formatter: headerFormatter })),
        react_1.default.createElement(tooltip_table_1.TooltipTable, { columns: columns, items: info.values, pinned: pinned, onSelect: onSelect, selected: selected }),
        footer && react_1.default.createElement(tooltip_footer_1.TooltipFooter, null, typeof footer === 'string' ? footer : footer(info.values))));
};
exports.TooltipBody = TooltipBody;
//# sourceMappingURL=tooltip_body.js.map