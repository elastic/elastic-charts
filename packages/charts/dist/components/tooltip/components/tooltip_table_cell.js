"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipTableCell = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const common_1 = require("../../../utils/common");
const TooltipTableCell = ({ style, truncate = false, tagName = 'td', className, children, title: manualTitle, }) => {
    const classes = (0, classnames_1.default)('echTooltip__tableCell', className, {
        'echTooltip__tableCell--truncate': truncate,
    });
    const title = manualTitle !== null && manualTitle !== void 0 ? manualTitle : (truncate && (0, common_1.isNonNullablePrimitiveValue)(children) ? `${children}` : undefined);
    return (react_1.default.createElement("div", { role: tagName === 'th' ? 'rowheader' : 'gridcell', className: classes, style: style, title: title }, children));
};
exports.TooltipTableCell = TooltipTableCell;
//# sourceMappingURL=tooltip_table_cell.js.map