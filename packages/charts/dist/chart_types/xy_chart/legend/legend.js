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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLegend = exports.getLegendExtra = void 0;
var constants_1 = require("../../../scales/constants");
var common_1 = require("../../../utils/common");
var geometry_1 = require("../../../utils/geometry");
var series_sort_1 = require("../../../utils/series_sort");
var get_api_scales_1 = require("../scales/get_api_scales");
var spec_1 = require("../state/utils/spec");
var tooltip_1 = require("../tooltip/tooltip");
var axis_utils_1 = require("../utils/axis_utils");
var default_series_sort_fn_1 = require("../utils/default_series_sort_fn");
var group_data_series_1 = require("../utils/group_data_series");
var series_1 = require("../utils/series");
var specs_1 = require("../utils/specs");
function getPostfix(spec) {
    if ((0, specs_1.isAreaSeriesSpec)(spec) || (0, specs_1.isBarSeriesSpec)(spec)) {
        var _a = spec.y0AccessorFormat, y0AccessorFormat = _a === void 0 ? tooltip_1.Y0_ACCESSOR_POSTFIX : _a, _b = spec.y1AccessorFormat, y1AccessorFormat = _b === void 0 ? tooltip_1.Y1_ACCESSOR_POSTFIX : _b;
        return { y0AccessorFormat: y0AccessorFormat, y1AccessorFormat: y1AccessorFormat };
    }
    return {};
}
function getBandedLegendItemLabel(name, yAccessor, postfixes) {
    return yAccessor === geometry_1.BandedAccessorType.Y1
        ? "".concat(name).concat(postfixes.y1AccessorFormat)
        : "".concat(name).concat(postfixes.y0AccessorFormat);
}
function getLegendExtra(showLegendExtra, xScaleType, formatter, key, lastValue) {
    var _a;
    if (showLegendExtra) {
        var rawValue = (_a = (lastValue && lastValue[key])) !== null && _a !== void 0 ? _a : null;
        var formattedValue = rawValue !== null ? formatter(rawValue) : null;
        return {
            raw: rawValue !== null ? rawValue : null,
            formatted: xScaleType === constants_1.ScaleType.Ordinal ? null : formattedValue,
            legendSizingLabel: formattedValue,
        };
    }
    return { raw: null, formatted: null, legendSizingLabel: null };
}
exports.getLegendExtra = getLegendExtra;
function getPointStyle(spec, theme) {
    var _a, _b, _c;
    if ((0, specs_1.isBubbleSeriesSpec)(spec)) {
        return (0, common_1.mergePartial)(theme.bubbleSeriesStyle.point, (_a = spec.bubbleSeriesStyle) === null || _a === void 0 ? void 0 : _a.point);
    }
    else if ((0, specs_1.isLineSeriesSpec)(spec)) {
        return (0, common_1.mergePartial)(theme.lineSeriesStyle.point, (_b = spec.lineSeriesStyle) === null || _b === void 0 ? void 0 : _b.point);
    }
    else if ((0, specs_1.isAreaSeriesSpec)(spec)) {
        return (0, common_1.mergePartial)(theme.areaSeriesStyle.point, (_c = spec.areaSeriesStyle) === null || _c === void 0 ? void 0 : _c.point);
    }
}
function computeLegend(dataSeries, lastValues, seriesColors, specs, axesSpecs, settingsSpec, serialIdentifierDataSeriesMap, theme, deselectedDataSeries) {
    var _a;
    if (deselectedDataSeries === void 0) { deselectedDataSeries = []; }
    var legendItems = [];
    var defaultColor = theme.colors.defaultVizColor;
    dataSeries.forEach(function (series) {
        var _a, _b;
        var specId = series.specId, yAccessor = series.yAccessor;
        var banded = (0, series_1.isBandedSpec)(series.spec);
        var key = (0, series_1.getSeriesKey)(series, series.groupId);
        var spec = (0, spec_1.getSpecsById)(specs, specId);
        var dataSeriesKey = (0, series_1.getSeriesKey)({
            specId: series.specId,
            yAccessor: series.yAccessor,
            splitAccessors: series.splitAccessors,
        }, series.groupId);
        var color = seriesColors.get(dataSeriesKey) || defaultColor;
        var hasSingleSeries = dataSeries.length === 1;
        var name = (0, series_1.getSeriesName)(series, hasSingleSeries, false, spec);
        var isSeriesHidden = deselectedDataSeries && (0, series_1.getSeriesIndex)(deselectedDataSeries, series) >= 0;
        if (name === '' || !spec)
            return;
        var postFixes = getPostfix(spec);
        var labelY1 = banded ? getBandedLegendItemLabel(name, geometry_1.BandedAccessorType.Y1, postFixes) : name;
        var yAxis = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, spec.groupId, settingsSpec.rotation).yAxis;
        var formatter = (_b = (_a = spec.tickFormat) !== null && _a !== void 0 ? _a : yAxis === null || yAxis === void 0 ? void 0 : yAxis.tickFormat) !== null && _b !== void 0 ? _b : axis_utils_1.defaultTickFormatter;
        var hideInLegend = spec.hideInLegend;
        var lastValue = lastValues.get(key);
        var seriesIdentifier = (0, series_1.getSeriesIdentifierFromDataSeries)(series);
        var xScaleType = (0, get_api_scales_1.getXScaleTypeFromSpec)(spec.xScaleType);
        var pointStyle = getPointStyle(spec, theme);
        legendItems.push({
            color: color,
            label: labelY1,
            seriesIdentifiers: [seriesIdentifier],
            childId: geometry_1.BandedAccessorType.Y1,
            isSeriesHidden: isSeriesHidden,
            isItemHidden: hideInLegend,
            isToggleable: true,
            defaultExtra: getLegendExtra(settingsSpec.showLegendExtra, xScaleType, formatter, 'y1', lastValue),
            path: [{ index: 0, value: seriesIdentifier.key }],
            keys: __spreadArray([specId, spec.groupId, yAccessor], __read(series.splitAccessors.values()), false),
            pointStyle: pointStyle,
        });
        if (banded) {
            var labelY0 = getBandedLegendItemLabel(name, geometry_1.BandedAccessorType.Y0, postFixes);
            legendItems.push({
                color: color,
                label: labelY0,
                seriesIdentifiers: [seriesIdentifier],
                childId: geometry_1.BandedAccessorType.Y0,
                isSeriesHidden: isSeriesHidden,
                isItemHidden: hideInLegend,
                isToggleable: true,
                defaultExtra: getLegendExtra(settingsSpec.showLegendExtra, xScaleType, formatter, 'y0', lastValue),
                path: [{ index: 0, value: seriesIdentifier.key }],
                keys: __spreadArray([specId, spec.groupId, yAccessor], __read(series.splitAccessors.values()), false),
                pointStyle: pointStyle,
            });
        }
    });
    var legendSortFn = (0, series_sort_1.getLegendCompareFn)(function (a, b) {
        var aDs = serialIdentifierDataSeriesMap[a.key];
        var bDs = serialIdentifierDataSeriesMap[b.key];
        return (0, default_series_sort_fn_1.defaultXYLegendSeriesSort)(aDs, bDs);
    });
    var sortFn = (_a = settingsSpec.legendSort) !== null && _a !== void 0 ? _a : legendSortFn;
    return (0, group_data_series_1.groupBy)(legendItems.sort(function (a, b) { return sortFn(a.seriesIdentifiers[0], b.seriesIdentifiers[0]); }), function (_a) {
        var keys = _a.keys, childId = _a.childId;
        return __spreadArray(__spreadArray([], __read(keys), false), [childId], false).join('__');
    }, true).map(function (d) {
        return __assign(__assign({}, d[0]), { seriesIdentifiers: d.map(function (_a) {
                var _b = __read(_a.seriesIdentifiers, 1), s = _b[0];
                return s;
            }), path: d.map(function (_a) {
                var _b = __read(_a.path, 1), p = _b[0];
                return p;
            }) });
    });
}
exports.computeLegend = computeLegend;
//# sourceMappingURL=legend.js.map