"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipTableColorCell = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const tooltip_provider_1 = require("./tooltip_provider");
const tooltip_table_cell_1 = require("./tooltip_table_cell");
const color_calcs_1 = require("../../../common/color_calcs");
const color_library_wrappers_1 = require("../../../common/color_library_wrappers");
const colors_1 = require("../../../common/colors");
function TooltipTableColorCell({ color, className, displayOnly, ...cellProps }) {
    const { backgroundColor, theme } = (0, tooltip_provider_1.useTooltipContext)();
    const getDotColor = (stripColor) => {
        if (color === colors_1.Colors.Transparent.keyword) {
            return theme.defaultDotColor;
        }
        const foregroundRGBA = (0, color_library_wrappers_1.colorToRgba)(stripColor === colors_1.Colors.Transparent.keyword ? backgroundColor : stripColor);
        const backgroundRGBA = (0, color_library_wrappers_1.colorToRgba)(backgroundColor);
        const blendedFgBg = (0, color_calcs_1.combineColors)(foregroundRGBA, backgroundRGBA);
        return (0, color_calcs_1.highContrastColor)(blendedFgBg, 'WCAG3').color.keyword;
    };
    const renderColorStrip = () => {
        if (!color)
            return null;
        const dotColor = getDotColor(color);
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "echTooltip__colorStrip--bg", style: { backgroundColor } }),
            react_1.default.createElement("div", { className: "echTooltip__colorStrip", style: { backgroundColor: color } },
                react_1.default.createElement("div", { className: "echTooltip__colorStrip--icon", style: { fill: dotColor } },
                    react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 16 16" },
                        react_1.default.createElement("path", { fillRule: "evenodd", d: "M6.50025,12.00025 C6.37225,12.00025 6.24425,11.95125 6.14625,11.85425 L2.14625,7.85425 C1.95125,7.65825 1.95125,7.34225 2.14625,7.14625 C2.34225,6.95125 2.65825,6.95125 2.85425,7.14625 L6.50025,10.79325 L13.14625,4.14625 C13.34225,3.95125 13.65825,3.95125 13.85425,4.14625 C14.04925,4.34225 14.04925,4.65825 13.85425,4.85425 L6.85425,11.85425 C6.75625,11.95125 6.62825,12.00025 6.50025,12.00025" })))),
            react_1.default.createElement("div", { className: "echTooltip__colorStrip--spacer" })));
    };
    return (react_1.default.createElement(tooltip_table_cell_1.TooltipTableCell, { ...cellProps, className: (0, classnames_1.default)('echTooltip__colorCell', className, {
            'echTooltip__colorCell--static': displayOnly,
        }) }, renderColorStrip()));
}
exports.TooltipTableColorCell = TooltipTableColorCell;
//# sourceMappingURL=tooltip_table_color_cell.js.map