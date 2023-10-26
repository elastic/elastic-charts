"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metric = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importStar(require("react"));
const progress_1 = require("./progress");
const sparkline_1 = require("./sparkline");
const text_1 = require("./text");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const constants_1 = require("../../../../common/constants");
const fill_text_color_1 = require("../../../../common/fill_text_color");
const common_1 = require("../../../../utils/common");
const specs_1 = require("../../specs");
const Metric = ({ chartId, hasTitles, rowIndex, columnIndex, totalColumns, totalRows, datum, panel, style, backgroundColor, contrastOptions, locale, onElementClick, onElementOver, onElementOut, }) => {
    const [mouseState, setMouseState] = (0, react_1.useState)('leave');
    const [lastMouseDownTimestamp, setLastMouseDownTimestamp] = (0, react_1.useState)(0);
    const metricHTMLId = `echMetric-${chartId}-${rowIndex}-${columnIndex}`;
    const hasProgressBar = (0, specs_1.isMetricWProgress)(datum);
    const progressBarDirection = hasProgressBar ? datum.progressBarDirection : undefined;
    const containerClassName = (0, classnames_1.default)('echMetric', {
        'echMetric--rightBorder': columnIndex < totalColumns - 1,
        'echMetric--bottomBorder': rowIndex < totalRows - 1,
        'echMetric--topBorder': hasTitles && rowIndex === 0,
        'echMetric--small': hasProgressBar,
        'echMetric--vertical': progressBarDirection === common_1.LayoutDirection.Vertical,
        'echMetric--horizontal': progressBarDirection === common_1.LayoutDirection.Horizontal,
    });
    const lightnessAmount = mouseState === 'leave' ? 0 : mouseState === 'enter' ? 0.05 : 0.1;
    const interactionColor = (0, color_library_wrappers_1.changeColorLightness)(datum.color, lightnessAmount, 0.8);
    const datumWithInteractionColor = {
        ...datum,
        color: interactionColor,
    };
    const event = { type: 'metricElementEvent', rowIndex, columnIndex };
    const containerStyle = {
        backgroundColor: !(0, specs_1.isMetricWTrend)(datumWithInteractionColor) && !(0, specs_1.isMetricWProgress)(datumWithInteractionColor)
            ? datumWithInteractionColor.color
            : undefined,
        cursor: onElementClick ? 'pointer' : constants_1.DEFAULT_CSS_CURSOR,
        borderColor: style.border,
    };
    const highContrastTextColor = (0, fill_text_color_1.fillTextColor)(backgroundColor, (0, specs_1.isMetricWProgress)(datum) ? backgroundColor : datum.color, undefined, contrastOptions);
    let finalTextColor = highContrastTextColor.color;
    if ((0, specs_1.isMetricWTrend)(datum)) {
        const { ratio, color, shade } = (0, fill_text_color_1.fillTextColor)(backgroundColor, (0, sparkline_1.getSparkLineColor)(datum.color), undefined, contrastOptions);
        if (shade !== highContrastTextColor.shade && ratio > highContrastTextColor.ratio) {
            finalTextColor = color;
        }
    }
    const onElementClickHandler = () => onElementClick && onElementClick([event]);
    return (react_1.default.createElement("div", { role: "figure", "aria-labelledby": datum.title && metricHTMLId, className: containerClassName, style: containerStyle, onMouseLeave: () => {
            if (onElementOut || onElementOver || onElementClick)
                setMouseState('leave');
            if (onElementOut)
                onElementOut();
        }, onMouseEnter: () => {
            if (onElementOut || onElementOver || onElementClick)
                setMouseState('enter');
            if (onElementOver)
                onElementOver([event]);
        }, onMouseDown: () => {
            if (onElementOut || onElementOver || onElementClick)
                setMouseState('down');
            setLastMouseDownTimestamp(Date.now());
        }, onMouseUp: () => {
            if (onElementOut || onElementOver || onElementClick)
                setMouseState('enter');
            if (Date.now() - lastMouseDownTimestamp < 200 && onElementClick) {
                onElementClickHandler();
            }
        }, onFocus: () => {
            if (onElementOut || onElementOver || onElementClick)
                setMouseState('enter');
        }, onBlur: () => {
            if (onElementOut || onElementOver || onElementClick)
                setMouseState('leave');
        }, onClick: (e) => {
            e.stopPropagation();
        } },
        react_1.default.createElement(text_1.MetricText, { id: metricHTMLId, datum: datumWithInteractionColor, panel: panel, style: style, onElementClick: onElementClick ? onElementClickHandler : undefined, highContrastTextColor: finalTextColor.keyword, locale: locale }),
        (0, specs_1.isMetricWTrend)(datumWithInteractionColor) && react_1.default.createElement(sparkline_1.SparkLine, { id: metricHTMLId, datum: datumWithInteractionColor }),
        (0, specs_1.isMetricWProgress)(datumWithInteractionColor) && (react_1.default.createElement(progress_1.ProgressBar, { datum: datumWithInteractionColor, barBackground: style.barBackground })),
        react_1.default.createElement("div", { className: "echMetric--outline", style: { color: finalTextColor.keyword } })));
};
exports.Metric = Metric;
//# sourceMappingURL=metric.js.map