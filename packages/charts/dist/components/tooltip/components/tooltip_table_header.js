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
exports.TooltipTableHeader = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var tooltip_table_cell_1 = require("./tooltip_table_cell");
var tooltip_table_color_cell_1 = require("./tooltip_table_color_cell");
var tooltip_table_row_1 = require("./tooltip_table_row");
var TooltipTableHeader = function (_a) {
    var maxHeight = _a.maxHeight, className = _a.className, props = __rest(_a, ["maxHeight", "className"]);
    var classes = (0, classnames_1.default)('echTooltip__tableHeader', className);
    if ('children' in props) {
        return (react_1.default.createElement("thead", { className: classes, style: { maxHeight: maxHeight } }, props.children));
    }
    if (props.columns.every(function (c) { return !c.header; }))
        return null;
    return (react_1.default.createElement("thead", { className: classes, style: { maxHeight: maxHeight } },
        react_1.default.createElement(tooltip_table_row_1.TooltipTableRow, null, props.columns.map(function (_a, i) {
            var header = _a.header, style = _a.style, id = _a.id, cn = _a.className, type = _a.type;
            var key = id !== null && id !== void 0 ? id : "".concat(type, "-").concat(i);
            if (type === 'color')
                return react_1.default.createElement(tooltip_table_color_cell_1.TooltipTableColorCell, { className: cn, style: style, key: key });
            return (react_1.default.createElement(tooltip_table_cell_1.TooltipTableCell, { className: cn, style: style, key: key }, header ? (typeof header === 'string' ? header : header(props.items)) : undefined));
        }))));
};
exports.TooltipTableHeader = TooltipTableHeader;
//# sourceMappingURL=tooltip_table_header.js.map