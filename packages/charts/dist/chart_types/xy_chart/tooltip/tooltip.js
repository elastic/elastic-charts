"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTooltipHeader = exports.formatTooltipValue = exports.getLegendItemExtraValues = exports.Y1_ACCESSOR_POSTFIX = exports.Y0_ACCESSOR_POSTFIX = void 0;
const accessor_1 = require("../../../utils/accessor");
const common_1 = require("../../../utils/common");
const geometry_1 = require("../../../utils/geometry");
const axis_utils_1 = require("../utils/axis_utils");
const series_1 = require("../utils/series");
const specs_1 = require("../utils/specs");
exports.Y0_ACCESSOR_POSTFIX = ' - lower';
exports.Y1_ACCESSOR_POSTFIX = ' - upper';
function getLegendItemExtraValues(tooltipValues, defaultValue) {
    const seriesTooltipValues = new Map();
    tooltipValues.forEach(({ formattedValue, seriesIdentifier, valueAccessor }) => {
        var _a;
        const seriesValue = defaultValue || formattedValue;
        const current = (_a = seriesTooltipValues.get(seriesIdentifier.key)) !== null && _a !== void 0 ? _a : new Map();
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
exports.getLegendItemExtraValues = getLegendItemExtraValues;
function formatTooltipValue({ color, value: { y, mark, accessor, datum }, seriesIdentifier }, spec, isHighlighted, hasSingleSeries, axisSpec) {
    var _a, _b;
    let label = (0, series_1.getSeriesName)(seriesIdentifier, hasSingleSeries, true, spec);
    if ((0, series_1.isBandedSpec)(spec) && ((0, specs_1.isAreaSeriesSpec)(spec) || (0, specs_1.isBarSeriesSpec)(spec))) {
        const { y0AccessorFormat = exports.Y0_ACCESSOR_POSTFIX, y1AccessorFormat = exports.Y1_ACCESSOR_POSTFIX } = spec;
        const formatter = accessor === geometry_1.BandedAccessorType.Y0 ? y0AccessorFormat : y1AccessorFormat;
        label = (0, accessor_1.getAccessorFormatLabel)(formatter, label);
    }
    const isVisible = label.length > 0 && (!spec.filterSeriesInTooltip || spec.filterSeriesInTooltip(seriesIdentifier));
    const markValue = mark === null || Number.isNaN(mark) ? null : mark;
    const tickFormatOptions = spec.timeZone ? { timeZone: spec.timeZone } : undefined;
    const tickFormatter = (_b = (_a = spec.tickFormat) !== null && _a !== void 0 ? _a : axisSpec === null || axisSpec === void 0 ? void 0 : axisSpec.tickFormat) !== null && _b !== void 0 ? _b : axis_utils_1.defaultTickFormatter;
    return {
        seriesIdentifier,
        valueAccessor: accessor,
        label,
        value: y,
        formattedValue: tickFormatter(y, tickFormatOptions),
        markValue,
        ...((0, common_1.isDefined)(markValue) && {
            formattedMarkValue: spec.markFormat
                ? spec.markFormat(markValue, tickFormatOptions)
                : (0, axis_utils_1.defaultTickFormatter)(markValue),
        }),
        color,
        isHighlighted,
        isVisible,
        datum,
    };
}
exports.formatTooltipValue = formatTooltipValue;
function formatTooltipHeader({ value: { x } }, spec, axisSpec) {
    var _a;
    const tickFormatOptions = spec.timeZone ? { timeZone: spec.timeZone } : undefined;
    const tickFormatter = (_a = axisSpec === null || axisSpec === void 0 ? void 0 : axisSpec.tickFormat) !== null && _a !== void 0 ? _a : axis_utils_1.defaultTickFormatter;
    return {
        value: x,
        formattedValue: tickFormatter(x, tickFormatOptions),
    };
}
exports.formatTooltipHeader = formatTooltipHeader;
//# sourceMappingURL=tooltip.js.map