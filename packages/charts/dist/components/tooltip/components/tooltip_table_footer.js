"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipTableFooter = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const tooltip_table_cell_1 = require("./tooltip_table_cell");
const tooltip_table_color_cell_1 = require("./tooltip_table_color_cell");
const tooltip_table_row_1 = require("./tooltip_table_row");
const TooltipTableFooter = ({ className, ...props }) => {
    const classes = (0, classnames_1.default)('echTooltip__tableFooter', className);
    if ('children' in props) {
        return (react_1.default.createElement("div", { role: "rowgroup", className: classes }, props.children));
    }
    if (props.columns.every((c) => !c.footer))
        return null;
    return (react_1.default.createElement("div", { role: "rowgroup", className: classes },
        react_1.default.createElement(tooltip_table_row_1.TooltipTableRow, null, props.columns.map(({ style, id, className: cn, type, footer }, i) => {
            const key = id !== null && id !== void 0 ? id : `${type}-${i}`;
            if (type === 'color')
                return react_1.default.createElement(tooltip_table_color_cell_1.TooltipTableColorCell, { className: cn, style: style, key: key });
            return (react_1.default.createElement(tooltip_table_cell_1.TooltipTableCell, { className: cn, style: style, key: id !== null && id !== void 0 ? id : key }, footer ? (typeof footer === 'string' ? footer : footer(props.items)) : undefined));
        }))));
};
exports.TooltipTableFooter = TooltipTableFooter;
//# sourceMappingURL=tooltip_table_footer.js.map