"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipTable = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var tooltip_table_body_1 = require("./tooltip_table_body");
var tooltip_table_footer_1 = require("./tooltip_table_footer");
var tooltip_table_header_1 = require("./tooltip_table_header");
var TooltipTable = function (_a) {
    var className = _a.className, maxHeight = _a.maxHeight, props = __rest(_a, ["className", "maxHeight"]);
    var classes = (0, classnames_1.default)('echTooltip__table', className);
    if ('children' in props) {
        return (react_1.default.createElement("table", { className: classes, style: { maxHeight: maxHeight } }, props.children));
    }
    var columns = props.columns.filter(function (_a) {
        var _b;
        var hidden = _a.hidden;
        return !(typeof hidden === 'boolean' ? hidden : (_b = hidden === null || hidden === void 0 ? void 0 : hidden(props.items)) !== null && _b !== void 0 ? _b : false);
    });
    return (react_1.default.createElement("table", { className: classes, style: { maxHeight: maxHeight } },
        react_1.default.createElement(tooltip_table_header_1.TooltipTableHeader, { columns: columns, items: props.items }),
        react_1.default.createElement(tooltip_table_body_1.TooltipTableBody, { columns: columns, items: props.items, pinned: props.pinned, onSelect: props.onSelect, selected: props.selected }),
        react_1.default.createElement(tooltip_table_footer_1.TooltipTableFooter, { columns: columns, items: props.items })));
};
exports.TooltipTable = TooltipTable;
//# sourceMappingURL=tooltip_table.js.map