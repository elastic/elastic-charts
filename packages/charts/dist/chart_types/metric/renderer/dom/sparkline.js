"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparkLine = exports.getSparkLineColor = void 0;
const react_1 = __importDefault(require("react"));
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const math_1 = require("../../../../common/math");
const path_1 = require("../../../../geoms/path");
const common_1 = require("../../../../utils/common");
const curves_1 = require("../../../../utils/curves");
const specs_1 = require("../../specs");
const getSparkLineColor = (color) => {
    const [h, s, l, a] = (0, color_library_wrappers_1.colorToHsl)(color);
    return (0, color_library_wrappers_1.hslToColor)(h, s, l >= 0.8 ? l - 0.1 : l + 0.1, a);
};
exports.getSparkLineColor = getSparkLineColor;
const SparkLine = ({ id, datum: { color, trend, trendA11yTitle, trendA11yDescription, trendShape } }) => {
    if (!trend) {
        return null;
    }
    const [xMin, xMax] = (0, math_1.extent)(trend.map((d) => d.x));
    const [, yMax] = (0, math_1.extent)(trend.map((d) => d.y));
    const xScale = (value) => (value - xMin) / (xMax - xMin);
    const yScale = (value) => value / yMax;
    const path = (0, path_1.areaGenerator)((d) => xScale(d.x), () => 1, (d) => 1 - yScale(d.y), (d) => (0, common_1.isFiniteNumber)(d.x) && (0, common_1.isFiniteNumber)(d.y), trendShape === specs_1.MetricTrendShape.Bars ? curves_1.CurveType.CURVE_STEP_AFTER : curves_1.CurveType.LINEAR);
    const titleId = `${id}-trend-title`;
    const descriptionId = `${id}-trend-description`;
    return (react_1.default.createElement("div", { className: "echSingleMetricSparkline" },
        react_1.default.createElement("svg", { className: "echSingleMetricSparkline__svg", width: "100%", height: "100%", viewBox: "0 0 1 1", preserveAspectRatio: "none", role: "img", "aria-labelledby": `${titleId} ${descriptionId}` },
            react_1.default.createElement("defs", null,
                react_1.default.createElement("mask", { id: "sparkline-mask" },
                    react_1.default.createElement("rect", { x: 0, y: 0, width: 1, height: 1, fill: "white", mask: "url(#sparkline-mask)" }),
                    react_1.default.createElement("path", { d: path.area(trend), transform: "translate(0, 0.5),scale(1,0.5)", fill: "black", stroke: "none", strokeWidth: 0 }))),
            react_1.default.createElement("title", { id: titleId, className: "echScreenReaderOnly" }, trendA11yTitle),
            react_1.default.createElement("text", { id: descriptionId, className: "echScreenReaderOnly", fontSize: 0 }, trendA11yDescription),
            react_1.default.createElement("rect", { x: 0, y: 0, width: 1, height: 1, fill: color, mask: "url(#sparkline-mask)" }),
            react_1.default.createElement("path", { d: path.area(trend), transform: "translate(0, 0.5),scale(1,0.5)", fill: (0, exports.getSparkLineColor)(color), stroke: "none", strokeWidth: 0 }))));
};
exports.SparkLine = SparkLine;
//# sourceMappingURL=sparkline.js.map