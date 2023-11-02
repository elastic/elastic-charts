"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricText = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const default_theme_attributes_1 = require("../../../../common/default_theme_attributes");
const canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
const common_1 = require("../../../../utils/common");
const wrap_1 = require("../../../../utils/text/wrap");
const specs_1 = require("../../specs");
const WIDTH_BP = [
    [0, 180, 's'],
    [180, 250, 'm'],
    [250, 600, 'l'],
    [600, 1000, 'xl'],
    [1000, 2000, 'xxl'],
    [2000, Infinity, 'xxxl'],
];
const PADDING = 8;
const LINE_HEIGHT = 1.2;
const ICON_SIZE = { s: 16, m: 16, l: 24, xl: 36, xxl: 44, xxxl: 64 };
const TITLE_FONT_SIZE = { s: 12, m: 16, l: 16, xl: 24, xxl: 32, xxxl: 42 };
const SUBTITLE_FONT_SIZE = { s: 10, m: 14, l: 14, xl: 20, xxl: 26, xxxl: 26 };
const EXTRA_FONT_SIZE = { s: 10, m: 14, l: 14, xl: 20, xxl: 26, xxxl: 26 };
const VALUE_FONT_SIZE = { s: 22, m: 27, l: 34, xl: 56, xxl: 88, xxxl: 140 };
const VALUE_PART_FONT_SIZE = { s: 16, m: 20, l: 24, xl: 40, xxl: 68, xxxl: 110 };
const TITLE_FONT = {
    fontStyle: 'normal',
    fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY,
    fontVariant: 'normal',
    fontWeight: 'bold',
    textColor: 'black',
};
const SUBTITLE_FONT = {
    ...TITLE_FONT,
    fontWeight: 'normal',
};
function findRange(ranges, value) {
    var _a, _b;
    const range = ranges.find(([min, max]) => min <= value && value < max);
    return range ? range[2] : (_b = (_a = ranges[0]) === null || _a === void 0 ? void 0 : _a[2]) !== null && _b !== void 0 ? _b : 's';
}
function elementVisibility(datum, panel, size, locale) {
    const LEFT_RIGHT_PADDING = 16;
    const maxTitlesWidth = (size === 's' ? 1 : 0.8) * panel.width - (datum.icon ? 24 : 0) - LEFT_RIGHT_PADDING;
    const titleHeight = (maxLines, textMeasure) => {
        return datum.title
            ? PADDING +
                (0, wrap_1.wrapText)(datum.title, TITLE_FONT, TITLE_FONT_SIZE[size], maxTitlesWidth, maxLines, textMeasure, locale)
                    .length *
                    TITLE_FONT_SIZE[size] *
                    LINE_HEIGHT
            : 0;
    };
    const subtitleHeight = (maxLines, textMeasure) => {
        return datum.subtitle
            ? PADDING +
                (0, wrap_1.wrapText)(datum.subtitle, SUBTITLE_FONT, SUBTITLE_FONT_SIZE[size], maxTitlesWidth, maxLines, textMeasure, locale).length *
                    SUBTITLE_FONT_SIZE[size] *
                    LINE_HEIGHT
            : 0;
    };
    const extraHeight = EXTRA_FONT_SIZE[size] * LINE_HEIGHT;
    const valueHeight = VALUE_FONT_SIZE[size] * LINE_HEIGHT + PADDING;
    const responsiveBreakPoints = [
        { titleMaxLines: 3, subtitleMaxLines: 2, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
        { titleMaxLines: 3, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
        { titleMaxLines: 2, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
        { titleMaxLines: 1, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
        { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: !!datum.extra },
        { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: false },
        { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: false },
    ];
    const isVisible = ({ titleMaxLines, subtitleMaxLines, title, subtitle, extra }, measure) => (title && titleMaxLines > 0 ? titleHeight(titleMaxLines, measure) : 0) +
        (subtitle && subtitleMaxLines > 0 ? subtitleHeight(subtitleMaxLines, measure) : 0) +
        (extra ? extraHeight : 0) +
        valueHeight <
        panel.height;
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)((textMeasure) => {
        var _a, _b, _c;
        const visibilityBreakpoint = (_a = responsiveBreakPoints.find((breakpoint) => isVisible(breakpoint, textMeasure))) !== null && _a !== void 0 ? _a : responsiveBreakPoints.at(-1);
        return {
            ...visibilityBreakpoint,
            titleLines: (0, wrap_1.wrapText)((_b = datum.title) !== null && _b !== void 0 ? _b : '', TITLE_FONT, TITLE_FONT_SIZE[size], maxTitlesWidth, visibilityBreakpoint.titleMaxLines, textMeasure, locale),
            subtitleLines: (0, wrap_1.wrapText)((_c = datum.subtitle) !== null && _c !== void 0 ? _c : '', SUBTITLE_FONT, SUBTITLE_FONT_SIZE[size], maxTitlesWidth, visibilityBreakpoint.subtitleMaxLines, textMeasure, locale),
        };
    });
}
function lineClamp(maxLines) {
    return {
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        lineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    };
}
const MetricText = ({ id, datum, panel, style, onElementClick, highContrastTextColor, locale }) => {
    var _a, _b;
    const { extra, value } = datum;
    const size = findRange(WIDTH_BP, panel.width);
    const hasProgressBar = (0, specs_1.isMetricWProgress)(datum);
    const progressBarDirection = (0, specs_1.isMetricWProgress)(datum) ? datum.progressBarDirection : undefined;
    const containerClassName = (0, classnames_1.default)('echMetricText', {
        'echMetricText--small': hasProgressBar,
        'echMetricText--vertical': progressBarDirection === common_1.LayoutDirection.Vertical,
        'echMetricText--horizontal': progressBarDirection === common_1.LayoutDirection.Horizontal,
    });
    const visibility = elementVisibility(datum, panel, size, locale);
    const titleWidthMaxSize = size === 's' ? '100%' : '80%';
    const titlesWidth = `min(${titleWidthMaxSize}, calc(${titleWidthMaxSize} - ${datum.icon ? '24px' : '0px'}))`;
    const isNumericalMetric = (0, specs_1.isMetricWNumber)(datum);
    const textParts = isNumericalMetric
        ? (0, common_1.isFiniteNumber)(value)
            ? splitNumericSuffixPrefix(datum.valueFormatter(value))
            : [{ emphasis: 'normal', text: style.nonFiniteText }]
        : [{ emphasis: 'normal', text: datum.value }];
    const TitleElement = () => (react_1.default.createElement("span", { style: {
            fontSize: `${TITLE_FONT_SIZE[size]}px`,
            whiteSpace: 'pre-wrap',
            width: titlesWidth,
            ...lineClamp(visibility.titleLines.length),
        }, title: datum.title }, datum.title));
    return (react_1.default.createElement("div", { className: containerClassName, style: { color: highContrastTextColor } },
        react_1.default.createElement("div", null,
            visibility.title && (react_1.default.createElement("h2", { id: id, className: "echMetricText__title" }, onElementClick ? (react_1.default.createElement("button", { onMouseDown: (e) => e.stopPropagation(), onMouseUp: (e) => e.stopPropagation(), onClick: (e) => {
                    e.stopPropagation();
                    onElementClick();
                } },
                react_1.default.createElement(TitleElement, null))) : (react_1.default.createElement(TitleElement, null)))),
            datum.icon && (react_1.default.createElement("div", { className: "echMetricText__icon" }, (0, common_1.renderWithProps)(datum.icon, {
                width: ICON_SIZE[size],
                height: ICON_SIZE[size],
                color: highContrastTextColor,
            })))),
        react_1.default.createElement("div", null, visibility.subtitle && (react_1.default.createElement("p", { className: "echMetricText__subtitle", style: {
                fontSize: `${SUBTITLE_FONT_SIZE[size]}px`,
                width: titlesWidth,
                whiteSpace: 'pre-wrap',
                ...lineClamp(visibility.subtitleLines.length),
            }, title: datum.subtitle }, datum.subtitle))),
        react_1.default.createElement("div", { className: "echMetricText__gap" }),
        react_1.default.createElement("div", null, visibility.extra && (react_1.default.createElement("p", { className: "echMetricText__extra", style: { fontSize: `${EXTRA_FONT_SIZE[size]}px` } }, extra))),
        react_1.default.createElement("div", null,
            react_1.default.createElement("p", { className: "echMetricText__value", style: {
                    fontSize: `${VALUE_FONT_SIZE[size]}px`,
                    textOverflow: isNumericalMetric ? undefined : 'ellipsis',
                    marginRight: datum.valueIcon ? ICON_SIZE[size] + 8 : undefined,
                    color: datum.valueColor,
                }, title: textParts.map(({ text }) => text).join('') }, textParts.map(({ emphasis, text }, i) => {
                return emphasis === 'small' ? (react_1.default.createElement("span", { key: `${text}${i}`, className: "echMetricText__part", style: { fontSize: `${VALUE_PART_FONT_SIZE[size]}px` } }, text)) : (text);
            })),
            datum.valueIcon && (react_1.default.createElement("p", { className: "echMetricText__valueIcon", style: { fontSize: `${VALUE_FONT_SIZE[size]}px`, color: (_a = datum.valueColor) !== null && _a !== void 0 ? _a : highContrastTextColor } }, (0, common_1.renderWithProps)(datum.valueIcon, {
                width: VALUE_PART_FONT_SIZE[size],
                height: VALUE_PART_FONT_SIZE[size],
                color: (_b = datum.valueColor) !== null && _b !== void 0 ? _b : highContrastTextColor,
                verticalAlign: 'middle',
            }))))));
};
exports.MetricText = MetricText;
function splitNumericSuffixPrefix(text) {
    return text
        .split('')
        .reduce((acc, curr) => {
        var _a, _b;
        const emphasis = curr === '.' || curr === ',' || (0, common_1.isFiniteNumber)(Number.parseInt(curr)) ? 'normal' : 'small';
        if (acc.length > 0 && ((_a = acc.at(-1)) === null || _a === void 0 ? void 0 : _a.emphasis) === emphasis) {
            (_b = acc.at(-1)) === null || _b === void 0 ? void 0 : _b.textParts.push(curr);
        }
        else {
            acc.push({ emphasis, textParts: [curr] });
        }
        return acc;
    }, [])
        .map(({ emphasis, textParts }) => ({
        emphasis,
        text: textParts.join(''),
    }));
}
//# sourceMappingURL=text.js.map