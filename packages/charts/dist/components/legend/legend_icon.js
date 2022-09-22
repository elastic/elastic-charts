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
exports.LegendIcon = void 0;
var react_1 = __importDefault(require("react"));
var shapes_paths_1 = require("../../chart_types/xy_chart/renderer/shapes_paths");
var theme_1 = require("../../utils/themes/theme");
var MARKER_SIZE = 8;
var LegendIcon = function (_a) {
    var pointStyle = _a.pointStyle, color = _a.color, ariaLabel = _a.ariaLabel;
    var _b = (pointStyle === null || pointStyle === void 0 ? void 0 : pointStyle.shape) ? pointStyle : {}, _c = _b.shape, shape = _c === void 0 ? theme_1.PointShape.Circle : _c, _d = _b.stroke, stroke = _d === void 0 ? color : _d, _e = _b.strokeWidth, strokeWidth = _e === void 0 ? 1 : _e, _f = _b.opacity, opacity = _f === void 0 ? 1 : _f;
    var _g = __read(shapes_paths_1.ShapeRendererFn[shape], 2), shapeFn = _g[0], rotation = _g[1];
    var adjustedSize = MARKER_SIZE - (strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : 0);
    return (react_1.default.createElement("svg", { width: MARKER_SIZE * 2, height: MARKER_SIZE * 2, "aria-label": ariaLabel },
        react_1.default.createElement("g", { transform: "\n          translate(".concat(MARKER_SIZE, ", ").concat(MARKER_SIZE, ")\n          rotate(").concat(rotation, ")\n        ") },
            react_1.default.createElement("path", { d: shapeFn(adjustedSize / 2), stroke: stroke, strokeWidth: strokeWidth, fill: color, opacity: opacity }))));
};
exports.LegendIcon = LegendIcon;
//# sourceMappingURL=legend_icon.js.map