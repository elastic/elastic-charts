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
exports.MetricText = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var common_1 = require("../../../../utils/common");
var specs_1 = require("../../specs");
var WIDTH_BP = [
    [0, 180, 's'],
    [180, 300, 'm'],
    [300, Infinity, 'l'],
];
var PADDING = 8;
var NUMBER_LINE_HEIGHT = 1.2;
var ICON_SIZE = { s: 16, m: 16, l: 24 };
var TITLE_FONT_SIZE = { s: 12, m: 16, l: 16 };
var SUBTITLE_FONT_SIZE = { s: 10, m: 14, l: 14 };
var EXTRA_FONT_SIZE = { s: 10, m: 14, l: 14 };
var VALUE_FONT_SIZE = { s: 22, m: 27, l: 34 };
var VALUE_PART_FONT_SIZE = { s: 16, m: 20, l: 24 };
function findRange(ranges, value) {
    var range = ranges.find(function (_a) {
        var _b = __read(_a, 2), min = _b[0], max = _b[1];
        return min <= value && value < max;
    });
    return range ? range[2] : ranges[0][2];
}
function elementVisibility(datum, panel, size) {
    var _a;
    var titleHeight = function (title, maxLines) {
        return PADDING + (title ? maxLines * TITLE_FONT_SIZE[size] * NUMBER_LINE_HEIGHT : 0);
    };
    var subtitleHeight = function (subtitle, maxLines) {
        return subtitle ? maxLines * SUBTITLE_FONT_SIZE[size] * NUMBER_LINE_HEIGHT + PADDING : 0;
    };
    var extraHeight = function (extra) { return (extra ? EXTRA_FONT_SIZE[size] * NUMBER_LINE_HEIGHT : 0); };
    var valueHeight = VALUE_FONT_SIZE[size] * NUMBER_LINE_HEIGHT + PADDING;
    var responsiveBreakPoints = [
        { titleLines: 3, subtitleLines: 2, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
        { titleLines: 3, subtitleLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
        { titleLines: 3, subtitleLines: 0, title: !!datum.title, subtitle: false, extra: !!datum.extra },
        { titleLines: 2, subtitleLines: 0, title: !!datum.title, subtitle: false, extra: !!datum.extra },
        { titleLines: 2, subtitleLines: 0, title: !!datum.title, subtitle: false, extra: false },
        { titleLines: 1, subtitleLines: 0, title: !!datum.title, subtitle: false, extra: false },
    ];
    var isVisible = function (_a) {
        var titleLines = _a.titleLines, subtitleLines = _a.subtitleLines, title = _a.title, subtitle = _a.subtitle, extra = _a.extra;
        return titleHeight(title, titleLines) + subtitleHeight(subtitle, subtitleLines) + extraHeight(extra) + valueHeight <
            panel.height;
    };
    return ((_a = responsiveBreakPoints.find(function (breakpoint) { return isVisible(breakpoint); })) !== null && _a !== void 0 ? _a : responsiveBreakPoints[responsiveBreakPoints.length - 1]);
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
var MetricText = function (_a) {
    var id = _a.id, datum = _a.datum, panel = _a.panel, style = _a.style, onElementClick = _a.onElementClick, highContrastTextColor = _a.highContrastTextColor;
    var title = datum.title, subtitle = datum.subtitle, extra = datum.extra, value = datum.value;
    var size = findRange(WIDTH_BP, panel.width);
    var hasProgressBar = (0, specs_1.isMetricWProgress)(datum);
    var progressBarDirection = (0, specs_1.isMetricWProgress)(datum) ? datum.progressBarDirection : undefined;
    var containerClassName = (0, classnames_1.default)('echMetricText', {
        'echMetricText--small': hasProgressBar,
        'echMetricText--vertical': progressBarDirection === common_1.LayoutDirection.Vertical,
        'echMetricText--horizontal': progressBarDirection === common_1.LayoutDirection.Horizontal,
    });
    var visibility = elementVisibility(datum, panel, size);
    var parts = splitNumericSuffixPrefix(datum.valueFormatter(value));
    var titleWidthMaxSize = size === 's' ? '100%' : '80%';
    var titleWidth = "min(".concat(titleWidthMaxSize, ", calc(").concat(titleWidthMaxSize, " - ").concat(datum.icon ? '24px' : '0px', "))");
    return (react_1.default.createElement("div", { className: containerClassName, style: { color: highContrastTextColor } },
        react_1.default.createElement("div", null,
            visibility.title && (react_1.default.createElement("h2", { id: id, className: "echMetricText__title", style: __assign(__assign({ fontSize: "".concat(TITLE_FONT_SIZE[size], "px") }, lineClamp(visibility.titleLines)), { width: titleWidth }) },
                react_1.default.createElement("button", { onMouseDown: function (e) { return e.stopPropagation(); }, onMouseUp: function (e) { return e.stopPropagation(); }, onClick: function (e) {
                        e.stopPropagation();
                        onElementClick();
                    } }, title))),
            datum.icon && (react_1.default.createElement("div", { className: "echMetricText__icon" }, (0, common_1.renderWithProps)(datum.icon, {
                width: ICON_SIZE[size],
                height: ICON_SIZE[size],
                color: highContrastTextColor,
            })))),
        react_1.default.createElement("div", null, visibility.subtitle && (react_1.default.createElement("p", { className: "echMetricText__subtitle", style: __assign({ fontSize: "".concat(SUBTITLE_FONT_SIZE[size], "px") }, lineClamp(visibility.subtitleLines)) }, subtitle))),
        react_1.default.createElement("div", { className: "echMetricText__gap" }),
        react_1.default.createElement("div", null, visibility.extra && (react_1.default.createElement("p", { className: "echMetricText__extra", style: { fontSize: "".concat(EXTRA_FONT_SIZE[size], "px") } }, extra))),
        react_1.default.createElement("div", null,
            react_1.default.createElement("p", { className: "echMetricText__value", style: { fontSize: "".concat(VALUE_FONT_SIZE[size], "px") } }, (0, common_1.isFiniteNumber)(value)
                ? parts.map(function (_a, i) {
                    var _b = __read(_a, 2), type = _b[0], text = _b[1];
                    return type === 'numeric' ? (text) : (react_1.default.createElement("span", { key: i, className: "echMetricText__part", style: { fontSize: "".concat(VALUE_PART_FONT_SIZE[size], "px") } }, text));
                })
                : style.nonFiniteText))));
};
exports.MetricText = MetricText;
function splitNumericSuffixPrefix(text) {
    var charts = text.split('');
    var parts = charts.reduce(function (acc, curr) {
        var type = curr === '.' || curr === ',' || (0, common_1.isFiniteNumber)(Number.parseInt(curr)) ? 'numeric' : 'string';
        if (acc.length > 0 && acc[acc.length - 1][0] === type) {
            acc[acc.length - 1][1].push(curr);
        }
        else {
            acc.push([type, [curr]]);
        }
        return acc;
    }, []);
    return parts.map(function (_a) {
        var _b = __read(_a, 2), type = _b[0], chars = _b[1];
        return [type, chars.join('')];
    });
}
//# sourceMappingURL=text.js.map