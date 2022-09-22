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
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTooltip = exports.getHighlightedValues = exports.Y1_ACCESSOR_POSTFIX = exports.Y0_ACCESSOR_POSTFIX = void 0;
var accessor_1 = require("../../../utils/accessor");
var common_1 = require("../../../utils/common");
var geometry_1 = require("../../../utils/geometry");
var axis_utils_1 = require("../utils/axis_utils");
var series_1 = require("../utils/series");
var specs_1 = require("../utils/specs");
exports.Y0_ACCESSOR_POSTFIX = ' - lower';
exports.Y1_ACCESSOR_POSTFIX = ' - upper';
function getHighlightedValues(tooltipValues, defaultValue) {
    var seriesTooltipValues = new Map();
    tooltipValues.forEach(function (_a) {
        var _b;
        var formattedValue = _a.formattedValue, seriesIdentifier = _a.seriesIdentifier, valueAccessor = _a.valueAccessor;
        var seriesValue = defaultValue || formattedValue;
        var current = (_b = seriesTooltipValues.get(seriesIdentifier.key)) !== null && _b !== void 0 ? _b : new Map();
        if (defaultValue) {
            if (!current.has(geometry_1.BandedAccessorType.Y0)) {
                current.set(geometry_1.BandedAccessorType.Y0, defaultValue);
            }
            if (!current.has(geometry_1.BandedAccessorType.Y1)) {
                current.set(geometry_1.BandedAccessorType.Y1, defaultValue);
            }
        }
        if (valueAccessor === geometry_1.BandedAccessorType.Y0 || valueAccessor === geometry_1.BandedAccessorType.Y1) {
            current.set(valueAccessor, seriesValue);
        }
        seriesTooltipValues.set(seriesIdentifier.key, current);
    });
    return seriesTooltipValues;
}
exports.getHighlightedValues = getHighlightedValues;
function formatTooltip(_a, spec, isHeader, isHighlighted, hasSingleSeries, axisSpec) {
    var _b, _c;
    var color = _a.color, _d = _a.value, x = _d.x, y = _d.y, mark = _d.mark, accessor = _d.accessor, datum = _d.datum, seriesIdentifier = _a.seriesIdentifier;
    var label = (0, series_1.getSeriesName)(seriesIdentifier, hasSingleSeries, true, spec);
    if ((0, series_1.isBandedSpec)(spec) && ((0, specs_1.isAreaSeriesSpec)(spec) || (0, specs_1.isBarSeriesSpec)(spec))) {
        var _e = spec.y0AccessorFormat, y0AccessorFormat = _e === void 0 ? exports.Y0_ACCESSOR_POSTFIX : _e, _f = spec.y1AccessorFormat, y1AccessorFormat = _f === void 0 ? exports.Y1_ACCESSOR_POSTFIX : _f;
        var formatter = accessor === geometry_1.BandedAccessorType.Y0 ? y0AccessorFormat : y1AccessorFormat;
        label = (0, accessor_1.getAccessorFormatLabel)(formatter, label);
    }
    var isVisible = label.length > 0 && (!spec.filterSeriesInTooltip || spec.filterSeriesInTooltip(seriesIdentifier));
    var value = isHeader ? x : y;
    var markValue = isHeader || mark === null || Number.isNaN(mark) ? null : mark;
    var tickFormatOptions = spec.timeZone ? { timeZone: spec.timeZone } : undefined;
    var tickFormatter = (_c = (isHeader ? axisSpec === null || axisSpec === void 0 ? void 0 : axisSpec.tickFormat : (_b = spec.tickFormat) !== null && _b !== void 0 ? _b : axisSpec === null || axisSpec === void 0 ? void 0 : axisSpec.tickFormat)) !== null && _c !== void 0 ? _c : axis_utils_1.defaultTickFormatter;
    return __assign(__assign({ seriesIdentifier: seriesIdentifier, valueAccessor: accessor, label: label, value: value, formattedValue: tickFormatter(value, tickFormatOptions), markValue: markValue }, ((0, common_1.isDefined)(markValue) && {
        formattedMarkValue: spec.markFormat
            ? spec.markFormat(markValue, tickFormatOptions)
            : (0, axis_utils_1.defaultTickFormatter)(markValue),
    })), { color: color, isHighlighted: isHighlighted && !isHeader, isVisible: isVisible, datum: datum });
}
exports.formatTooltip = formatTooltip;
//# sourceMappingURL=tooltip.js.map