"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegendIcon = void 0;
const react_1 = __importDefault(require("react"));
const shapes_paths_1 = require("../../chart_types/xy_chart/renderer/shapes_paths");
const common_1 = require("../../utils/common");
const theme_1 = require("../../utils/themes/theme");
const MARKER_SIZE = 8;
const LegendIcon = ({ pointStyle, color, ariaLabel }) => {
    const { shape = theme_1.PointShape.Circle, stroke = color, strokeWidth = 1, opacity = 1, } = (pointStyle === null || pointStyle === void 0 ? void 0 : pointStyle.shape) ? pointStyle : {};
    const [shapeFn, rotation] = shapes_paths_1.ShapeRendererFn[shape];
    const adjustedSize = MARKER_SIZE - (strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 0);
    return (react_1.default.createElement("svg", { width: MARKER_SIZE * 2, height: MARKER_SIZE * 2, "aria-label": ariaLabel },
        react_1.default.createElement("g", { transform: `
          translate(${MARKER_SIZE}, ${MARKER_SIZE})
          rotate(${rotation})
        ` },
            react_1.default.createElement("path", { d: shapeFn(adjustedSize / 2), stroke: (0, common_1.getColorFromVariant)(color, stroke), strokeWidth: strokeWidth, fill: color, opacity: opacity }))));
};
exports.LegendIcon = LegendIcon;
//# sourceMappingURL=legend_icon.js.map