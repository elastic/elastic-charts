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
exports.TooltipTableFooter = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var tooltip_table_cell_1 = require("./tooltip_table_cell");
var tooltip_table_color_cell_1 = require("./tooltip_table_color_cell");
var tooltip_table_row_1 = require("./tooltip_table_row");
var TooltipTableFooter = function (_a) {
    var maxHeight = _a.maxHeight, className = _a.className, props = __rest(_a, ["maxHeight", "className"]);
    var classes = (0, classnames_1.default)('echTooltip__tableFooter', className);
    if ('children' in props) {
        return (react_1.default.createElement("tfoot", { className: classes, style: { maxHeight: maxHeight } }, props.children));
    }
    if (props.columns.every(function (c) { return !c.footer; }))
        return null;
    return (react_1.default.createElement("tfoot", { className: classes },
        react_1.default.createElement(tooltip_table_row_1.TooltipTableRow, { maxHeight: maxHeight }, props.columns.map(function (_a, i) {
            var style = _a.style, id = _a.id, cn = _a.className, type = _a.type, footer = _a.footer;
            var key = id !== null && id !== void 0 ? id : "".concat(type, "-").concat(i);
            if (type === 'color')
                return react_1.default.createElement(tooltip_table_color_cell_1.TooltipTableColorCell, { className: cn, style: style, key: key });
            return (react_1.default.createElement(tooltip_table_cell_1.TooltipTableCell, { className: cn, style: style, key: id !== null && id !== void 0 ? id : key }, footer ? (typeof footer === 'string' ? footer : footer(props.items)) : undefined));
        }))));
};
exports.TooltipTableFooter = TooltipTableFooter;
//# sourceMappingURL=tooltip_table_footer.js.map