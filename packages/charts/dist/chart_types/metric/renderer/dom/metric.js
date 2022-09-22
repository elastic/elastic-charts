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
exports.Metric = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importStar(require("react"));
var color_calcs_1 = require("../../../../common/color_calcs");
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var colors_1 = require("../../../../common/colors");
var constants_1 = require("../../../../common/constants");
var common_1 = require("../../../../utils/common");
var specs_1 = require("../../specs");
var progress_1 = require("./progress");
var sparkline_1 = require("./sparkline");
var text_1 = require("./text");
var Metric = function (_a) {
    var chartId = _a.chartId, rowIndex = _a.rowIndex, columnIndex = _a.columnIndex, totalColumns = _a.totalColumns, totalRows = _a.totalRows, datum = _a.datum, panel = _a.panel, style = _a.style, onElementClick = _a.onElementClick, onElementOver = _a.onElementOver, onElementOut = _a.onElementOut;
    var _b = __read((0, react_1.useState)('leave'), 2), mouseState = _b[0], setMouseState = _b[1];
    var _c = __read((0, react_1.useState)(0), 2), lastMouseDownTimestamp = _c[0], setLastMouseDownTimestamp = _c[1];
    var metricHTMLId = "echMetric-".concat(chartId, "-").concat(rowIndex, "-").concat(columnIndex);
    var hasProgressBar = (0, specs_1.isMetricWProgress)(datum);
    var progressBarDirection = hasProgressBar ? datum.progressBarDirection : undefined;
    var containerClassName = (0, classnames_1.default)('echMetric', {
        'echMetric--rightBorder': columnIndex < totalColumns - 1,
        'echMetric--bottomBorder': rowIndex < totalRows - 1,
        'echMetric--small': hasProgressBar,
        'echMetric--vertical': progressBarDirection === common_1.LayoutDirection.Vertical,
        'echMetric--horizontal': progressBarDirection === common_1.LayoutDirection.Horizontal,
    });
    var lightnessAmount = mouseState === 'leave' ? 0 : mouseState === 'enter' ? 0.05 : 0.1;
    var interactionColor = (0, color_library_wrappers_1.changeColorLightness)(datum.color, lightnessAmount, 0.8);
    var backgroundInteractionColor = (0, color_library_wrappers_1.changeColorLightness)(style.background, lightnessAmount, 0.8);
    var datumWithInteractionColor = __assign(__assign({}, datum), { color: interactionColor });
    var updatedStyle = __assign(__assign({}, style), { background: backgroundInteractionColor });
    var event = { type: 'metricElementEvent', rowIndex: rowIndex, columnIndex: columnIndex };
    var containerStyle = {
        backgroundColor: !(0, specs_1.isMetricWTrend)(datumWithInteractionColor) && !(0, specs_1.isMetricWProgress)(datumWithInteractionColor)
            ? datumWithInteractionColor.color
            : updatedStyle.background,
        cursor: onElementClick ? 'pointer' : constants_1.DEFAULT_CSS_CURSOR,
    };
    var bgColor = (0, specs_1.isMetricWTrend)(datum) || !(0, specs_1.isMetricWProgress)(datum) ? datum.color : style.background;
    var highContrastTextColor = (0, color_calcs_1.highContrastColor)((0, color_library_wrappers_1.colorToRgba)(bgColor)) === colors_1.Colors.White.rgba ? style.text.lightColor : style.text.darkColor;
    var onElementClickHandler = function () { return onElementClick && onElementClick([event]); };
    return (react_1.default.createElement("div", { role: "figure", "aria-labelledby": datum.title && metricHTMLId, className: containerClassName, style: containerStyle, onMouseLeave: function () {
            setMouseState('leave');
            if (onElementOut)
                onElementOut();
        }, onMouseEnter: function () {
            setMouseState('enter');
            if (onElementOver)
                onElementOver([event]);
        }, onMouseDown: function () {
            setMouseState('down');
            setLastMouseDownTimestamp(Date.now());
        }, onMouseUp: function () {
            setMouseState('enter');
            if (Date.now() - lastMouseDownTimestamp < 200 && onElementClick) {
                onElementClickHandler();
            }
        }, onFocus: function () {
            setMouseState('enter');
        }, onBlur: function () {
            setMouseState('leave');
        }, onClick: function (e) {
            e.stopPropagation();
        } },
        react_1.default.createElement(text_1.MetricText, { id: metricHTMLId, datum: datumWithInteractionColor, panel: panel, style: updatedStyle, onElementClick: onElementClickHandler, highContrastTextColor: highContrastTextColor }),
        (0, specs_1.isMetricWTrend)(datumWithInteractionColor) && react_1.default.createElement(sparkline_1.SparkLine, { id: metricHTMLId, datum: datumWithInteractionColor }),
        (0, specs_1.isMetricWProgress)(datumWithInteractionColor) && (react_1.default.createElement(progress_1.ProgressBar, { datum: datumWithInteractionColor, barBackground: updatedStyle.barBackground })),
        react_1.default.createElement("div", { className: "echMetric--outline", style: { color: highContrastTextColor } })));
};
exports.Metric = Metric;
//# sourceMappingURL=metric.js.map