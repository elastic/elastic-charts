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
exports.TooltipTableBody = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importStar(require("react"));
const tooltip_table_cell_1 = require("./tooltip_table_cell");
const tooltip_table_color_cell_1 = require("./tooltip_table_color_cell");
const tooltip_table_row_1 = require("./tooltip_table_row");
const TooltipTableBody = ({ className, ...props }) => {
    const tableBodyRef = (0, react_1.useRef)(null);
    if ('children' in props) {
        const classes = (0, classnames_1.default)('echTooltip__tableBody', className);
        return (react_1.default.createElement("div", { role: "rowgroup", className: classes }, props.children));
    }
    const { items, pinned, selected, onSelect, columns } = props;
    const classes = (0, classnames_1.default)('echTooltip__tableBody');
    const allHighlighted = items.every((i) => i.isHighlighted);
    return (react_1.default.createElement("div", { role: "rowgroup", className: classes, ref: tableBodyRef }, items.map((item) => {
        const { isHighlighted, isVisible, displayOnly } = item;
        if (!isVisible)
            return null;
        return (react_1.default.createElement(tooltip_table_row_1.TooltipTableRow, { key: `${item.seriesIdentifier.key}-${item.label}-${item.value}`, isHighlighted: !pinned && !allHighlighted && isHighlighted, isSelected: pinned && selected.includes(item), onSelect: displayOnly || !onSelect ? undefined : () => onSelect(item) }, columns.map((column, j) => {
            var _a;
            return renderCellContent(item, column, (_a = column.id) !== null && _a !== void 0 ? _a : `${column.type}-${j}`);
        })));
    })));
};
exports.TooltipTableBody = TooltipTableBody;
function getCellStyles({ style, type, }) {
    const textAlign = type === 'number' ? 'right' : type === 'text' ? 'left' : undefined;
    return {
        textAlign,
        ...style,
    };
}
function renderCellContent(item, column, key) {
    if (column.type === 'color') {
        return react_1.default.createElement(tooltip_table_color_cell_1.TooltipTableColorCell, { displayOnly: item.displayOnly, color: item.color, key: key });
    }
    return (react_1.default.createElement(tooltip_table_cell_1.TooltipTableCell, { truncate: column.truncate, style: getCellStyles(column), key: key }, column.cell(item)));
}
//# sourceMappingURL=tooltip_table_body.js.map