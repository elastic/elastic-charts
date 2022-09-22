"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparkLine = void 0;
var react_1 = __importDefault(require("react"));
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var math_1 = require("../../../../common/math");
var path_1 = require("../../../../geoms/path");
var common_1 = require("../../../../utils/common");
var curves_1 = require("../../../../utils/curves");
var specs_1 = require("../../specs");
var SparkLine = function (_a) {
    var id = _a.id, _b = _a.datum, color = _b.color, trend = _b.trend, trendA11yTitle = _b.trendA11yTitle, trendA11yDescription = _b.trendA11yDescription, trendShape = _b.trendShape;
    if (!trend) {
        return null;
    }
    var _c = __read((0, math_1.extent)(trend.map(function (d) { return d.x; })), 2), xMin = _c[0], xMax = _c[1];
    var _d = __read((0, math_1.extent)(trend.map(function (d) { return d.y; })), 2), yMax = _d[1];
    var xScale = function (value) { return (value - xMin) / (xMax - xMin); };
    var yScale = function (value) { return value / yMax; };
    var path = (0, path_1.areaGenerator)(function (d) { return xScale(d.x); }, function () { return 1; }, function (d) { return 1 - yScale(d.y); }, function (d) { return (0, common_1.isFiniteNumber)(d.x) && (0, common_1.isFiniteNumber)(d.y); }, trendShape === specs_1.MetricTrendShape.Bars ? curves_1.CurveType.CURVE_STEP_AFTER : curves_1.CurveType.LINEAR);
    var _e = __read((0, color_library_wrappers_1.colorToHsl)(color), 3), h = _e[0], s = _e[1], l = _e[2];
    var pathColor = (0, color_library_wrappers_1.hslToColor)(h, s, l >= 0.8 ? l - 0.1 : l + 0.1);
    var titleId = "".concat(id, "-trend-title");
    var descriptionId = "".concat(id, "-trend-description");
    return (react_1.default.createElement("div", { className: "echSingleMetricSparkline" },
        react_1.default.createElement("svg", { className: "echSingleMetricSparkline__svg", width: "100%", height: "100%", viewBox: "0 0 1 1", preserveAspectRatio: "none", role: "img", "aria-labelledby": "".concat(titleId, " ").concat(descriptionId) },
            react_1.default.createElement("title", { id: titleId, className: "echScreenReaderOnly" }, trendA11yTitle),
            react_1.default.createElement("text", { id: descriptionId, className: "echScreenReaderOnly", fontSize: 0 }, trendA11yDescription),
            react_1.default.createElement("rect", { x: 0, y: 0, width: 1, height: 1, fill: color }),
            react_1.default.createElement("path", { d: path.area(trend), transform: "translate(0, 0.5),scale(1,0.5)", fill: pathColor, stroke: "none", strokeWidth: 0 }))));
};
exports.SparkLine = SparkLine;
//# sourceMappingURL=sparkline.js.map