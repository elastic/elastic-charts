"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTableMaxHeight = exports.TooltipTable = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const tooltip_provider_1 = require("./tooltip_provider");
const tooltip_table_body_1 = require("./tooltip_table_body");
const tooltip_table_footer_1 = require("./tooltip_table_footer");
const tooltip_table_header_1 = require("./tooltip_table_header");
const common_1 = require("../../../utils/common");
const TOOLTIP_ITEM_HEIGHT = 20;
const TOOLTIP_HEADER_HEIGHT = 25;
const TOOLTIP_FOOTER_HEIGHT = 25;
const COLOR_STRIP_CHECK_WIDTH = 11;
const TooltipTable = ({ className, ...props }) => {
    var _a;
    const tooltipContext = (0, tooltip_provider_1.useTooltipContext)();
    const pinned = (_a = props.pinned) !== null && _a !== void 0 ? _a : tooltipContext.pinned;
    const wrapperClasses = (0, classnames_1.default)('echTooltip__tableWrapper', { 'echTooltip__tableWrapper--pinned': pinned });
    if ('children' in props) {
        const { gridTemplateColumns, maxHeight } = props;
        const classes = (0, classnames_1.default)('echTooltip__table', className, {
            'echTooltip__table--noGrid': !gridTemplateColumns,
        });
        return (react_1.default.createElement("div", { className: wrapperClasses, style: { maxHeight } },
            react_1.default.createElement("div", { role: "table", className: classes, style: { gridTemplateColumns } }, props.children)));
    }
    const { items, onSelect, selected = [] } = { selected: tooltipContext.selected, ...props };
    const columns = props.columns.filter(({ hidden }) => {
        var _a;
        return !(typeof hidden === 'boolean' ? hidden : (_a = hidden === null || hidden === void 0 ? void 0 : hidden(props.items)) !== null && _a !== void 0 ? _a : false);
    });
    const gridTemplateColumns = columns
        .map(({ type, width }) => width !== null && width !== void 0 ? width : (type === 'color' ? COLOR_STRIP_CHECK_WIDTH : 'auto'))
        .map((width) => (typeof width === 'number' ? `${width}px` : width))
        .join(' ');
    return (react_1.default.createElement("div", { className: wrapperClasses, style: { maxHeight: props.maxHeight } },
        react_1.default.createElement("div", { role: "table", className: (0, classnames_1.default)('echTooltip__table', className), style: { gridTemplateColumns } },
            react_1.default.createElement(tooltip_table_header_1.TooltipTableHeader, { columns: columns, items: props.items }),
            react_1.default.createElement(tooltip_table_body_1.TooltipTableBody, { columns: columns, items: items, pinned: pinned, onSelect: onSelect, selected: selected }),
            react_1.default.createElement(tooltip_table_footer_1.TooltipTableFooter, { columns: columns, items: props.items }))));
};
exports.TooltipTable = TooltipTable;
function computeTableMaxHeight(pinned, columns, maxHeight, maxItems) {
    if (pinned || (0, common_1.isNil)(maxItems))
        return maxHeight;
    const headerHeight = +columns.some((c) => c.header) * TOOLTIP_HEADER_HEIGHT;
    const bodyHeight = (Math.max(maxItems, 1) + 0.5) * TOOLTIP_ITEM_HEIGHT;
    const footerHeight = +columns.some((c) => c.footer) * TOOLTIP_FOOTER_HEIGHT;
    return headerHeight + bodyHeight + footerHeight;
}
exports.computeTableMaxHeight = computeTableMaxHeight;
//# sourceMappingURL=tooltip_table.js.map