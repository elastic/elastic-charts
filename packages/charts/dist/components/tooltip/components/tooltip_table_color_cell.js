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
exports.TooltipTableColorCell = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var color_calcs_1 = require("../../../common/color_calcs");
var color_library_wrappers_1 = require("../../../common/color_library_wrappers");
var colors_1 = require("../../../common/colors");
var tooltip_provider_1 = require("./tooltip_provider");
var tooltip_table_cell_1 = require("./tooltip_table_cell");
function TooltipTableColorCell(_a) {
    var color = _a.color, className = _a.className, displayOnly = _a.displayOnly, cellProps = __rest(_a, ["color", "className", "displayOnly"]);
    var backgroundColor = (0, tooltip_provider_1.useTooltipContext)().backgroundColor;
    var renderColorStrip = function (stripColor) {
        var foregroundRGBA = (0, color_library_wrappers_1.colorToRgba)(stripColor);
        var backgroundRGBA = (0, color_library_wrappers_1.colorToRgba)(backgroundColor);
        var blendedFgBg = (0, color_calcs_1.combineColors)(foregroundRGBA, backgroundRGBA);
        var dotColor = (0, color_library_wrappers_1.RGBATupleToString)((0, color_calcs_1.highContrastColor)(blendedFgBg, 'WCAG3'));
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "echTooltip__colorStrip", style: { backgroundColor: backgroundColor } }),
            react_1.default.createElement("div", { className: "echTooltip__colorStrip", style: { backgroundColor: color, color: dotColor } }),
            react_1.default.createElement("div", { className: "echTooltip__colorStripSpacer" })));
    };
    return (react_1.default.createElement(tooltip_table_cell_1.TooltipTableCell, __assign({}, cellProps, { className: (0, classnames_1.default)('echTooltip__colorCell', className, {
            'echTooltip__colorCell--empty': !color,
            'echTooltip__colorCell--static': displayOnly,
        }) }), color && color !== colors_1.Colors.Transparent.keyword ? renderColorStrip(color) : null));
}
exports.TooltipTableColorCell = TooltipTableColorCell;
//# sourceMappingURL=tooltip_table_color_cell.js.map