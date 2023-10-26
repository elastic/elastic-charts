"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipTableRow = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const tooltip_provider_1 = require("./tooltip_provider");
const common_1 = require("../../../utils/common");
const TooltipTableRow = ({ id, isHighlighted = false, isSelected = false, children, onSelect, className, }) => {
    const { actionable } = (0, tooltip_provider_1.useTooltipContext)();
    const isSelectable = actionable && !(0, common_1.isNil)(onSelect);
    const classes = (0, classnames_1.default)('echTooltip__tableRow', className, {
        'echTooltip__tableRow--highlighted': isHighlighted,
        'echTooltip__tableRow--selected': isSelected,
        'echTooltip__tableRow--selectable': isSelectable,
    });
    return (react_1.default.createElement("div", { role: "row", id: id, className: classes, onClick: isSelectable ? onSelect : undefined, onKeyPress: isSelectable ? onSelect : undefined }, children));
};
exports.TooltipTableRow = TooltipTableRow;
//# sourceMappingURL=tooltip_table_row.js.map