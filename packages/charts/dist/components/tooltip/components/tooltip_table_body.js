"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.TooltipTableBody = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importStar(require("react"));
var use_render_skip_1 = require("../../../common/hooks/use_render_skip");
var debounce_1 = require("../../../utils/debounce");
var tooltip_provider_1 = require("./tooltip_provider");
var tooltip_table_cell_1 = require("./tooltip_table_cell");
var tooltip_table_color_cell_1 = require("./tooltip_table_color_cell");
var tooltip_table_row_1 = require("./tooltip_table_row");
var getRowId = function (i) { return "table-scroll-to-row-".concat(i); };
var TooltipTableBody = function (_a) {
    var _b, _c;
    var className = _a.className, props = __rest(_a, ["className"]);
    var ready = (0, use_render_skip_1.useRenderSkip)();
    var theme = (0, tooltip_provider_1.useTooltipContext)().theme;
    var maxHeight = (_b = props.maxHeight) !== null && _b !== void 0 ? _b : theme.maxTableBodyHeight;
    var tableBodyRef = (0, react_1.useRef)(null);
    var targetRowIndex = 'items' in props ? ((_c = props === null || props === void 0 ? void 0 : props.items) !== null && _c !== void 0 ? _c : []).findIndex(function (_a) {
        var isHighlighted = _a.isHighlighted;
        return isHighlighted;
    }) : -1;
    var scrollToTarget = (0, debounce_1.debounce)(function (i) {
        var _a;
        var target = (_a = tableBodyRef.current) === null || _a === void 0 ? void 0 : _a.querySelector("#".concat(getRowId(i)));
        if (!target)
            return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
    }, 100);
    (0, react_1.useEffect)(function () {
        if (!ready || targetRowIndex === -1 || props.pinned)
            return;
        scrollToTarget(targetRowIndex);
    }, [scrollToTarget, ready, targetRowIndex, props.pinned]);
    if ('children' in props) {
        var classes_1 = (0, classnames_1.default)('echTooltip__tableBody', className);
        return (react_1.default.createElement("tbody", { className: classes_1, style: { maxHeight: maxHeight } }, props.children));
    }
    var classes = (0, classnames_1.default)('echTooltip__tableBody');
    return (react_1.default.createElement("tbody", { className: classes, ref: tableBodyRef, style: { maxHeight: maxHeight } }, props.items.map(function (item, i) {
        var isHighlighted = item.isHighlighted, isVisible = item.isVisible, displayOnly = item.displayOnly;
        if (!isVisible)
            return null;
        return (react_1.default.createElement(tooltip_table_row_1.TooltipTableRow, { key: "".concat(item.seriesIdentifier.key, "-").concat(item.value), id: getRowId(i), isHighlighted: !props.pinned && isHighlighted, isSelected: props.pinned && props.selected.includes(item), onSelect: displayOnly ? undefined : function () { return props.onSelect(item); } }, props.columns.map(function (column, j) {
            var _a;
            return renderCellContent(item, column, (_a = column.id) !== null && _a !== void 0 ? _a : "".concat(column.type, "-").concat(j));
        })));
    })));
};
exports.TooltipTableBody = TooltipTableBody;
function getCellStyles(_a) {
    var style = _a.style, type = _a.type;
    var textAlign = type === 'number' ? 'left' : type === 'text' ? 'right' : undefined;
    return __assign({ textAlign: textAlign }, style);
}
function renderCellContent(item, column, key) {
    if (column.type === 'color') {
        return react_1.default.createElement(tooltip_table_color_cell_1.TooltipTableColorCell, { displayOnly: item.displayOnly, color: item.color, key: key });
    }
    return (react_1.default.createElement(tooltip_table_cell_1.TooltipTableCell, { style: getCellStyles(column), key: key }, column.cell(item)));
}
//# sourceMappingURL=tooltip_table_body.js.map