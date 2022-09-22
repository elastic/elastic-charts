"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipTableRow = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var common_1 = require("../../../utils/common");
var TooltipTableRow = function (_a) {
    var id = _a.id, maxHeight = _a.maxHeight, _b = _a.isHighlighted, isHighlighted = _b === void 0 ? false : _b, _c = _a.isSelected, isSelected = _c === void 0 ? false : _c, children = _a.children, onSelect = _a.onSelect, className = _a.className;
    var classes = (0, classnames_1.default)('echTooltip__tableRow', className, {
        'echTooltip__tableRow--highlighted': isHighlighted,
        'echTooltip__tableRow--selected': isSelected,
        'echTooltip__tableRow--selectable': !(0, common_1.isNil)(onSelect),
    });
    return (react_1.default.createElement("tr", { id: id, className: classes, style: { maxHeight: maxHeight }, onClick: onSelect }, children));
};
exports.TooltipTableRow = TooltipTableRow;
//# sourceMappingURL=tooltip_table_row.js.map