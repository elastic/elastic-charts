"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipTableCell = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var TooltipTableCell = function (_a) {
    var style = _a.style, _b = _a.tagName, tagName = _b === void 0 ? 'td' : _b, className = _a.className, children = _a.children;
    var classes = (0, classnames_1.default)('echTooltip__tableCell', className);
    if (tagName === 'th') {
        return (react_1.default.createElement("th", { className: classes, style: style }, children));
    }
    return (react_1.default.createElement("td", { className: classes, style: style }, children));
};
exports.TooltipTableCell = TooltipTableCell;
//# sourceMappingURL=tooltip_table_cell.js.map