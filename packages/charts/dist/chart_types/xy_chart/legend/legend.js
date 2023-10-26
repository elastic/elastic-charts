"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLegend = exports.getLegendExtra = void 0;
const constants_1 = require("../../../scales/constants");
const common_1 = require("../../../utils/common");
const geometry_1 = require("../../../utils/geometry");
const series_sort_1 = require("../../../utils/series_sort");
const get_api_scales_1 = require("../scales/get_api_scales");
const spec_1 = require("../state/utils/spec");
const tooltip_1 = require("../tooltip/tooltip");
const axis_utils_1 = require("../utils/axis_utils");
const default_series_sort_fn_1 = require("../utils/default_series_sort_fn");
const group_data_series_1 = require("../utils/group_data_series");
const series_1 = require("../utils/series");
const specs_1 = require("../utils/specs");
function getPostfix(spec) {
    if ((0, specs_1.isAreaSeriesSpec)(spec) || (0, specs_1.isBarSeriesSpec)(spec)) {
        const { y0AccessorFormat = tooltip_1.Y0_ACCESSOR_POSTFIX, y1AccessorFormat = tooltip_1.Y1_ACCESSOR_POSTFIX } = spec;
        return { y0AccessorFormat, y1AccessorFormat };
    }
    return {};
}
function getBandedLegendItemLabel(name, yAccessor, postfixes) {
    return yAccessor === geometry_1.BandedAccessorType.Y1
        ? `${name}${postfixes.y1AccessorFormat}`
        : `${name}${postfixes.y0AccessorFormat}`;
}
function getLegendExtra(showLegendExtra, xScaleType, formatter, key, lastValue) {
    var _a;
    if (showLegendExtra) {
        const rawValue = (_a = (lastValue && lastValue[key])) !== null && _a !== void 0 ? _a : null;
        const formattedValue = rawValue !== null ? formatter(rawValue) : null;
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
function computeLegend(dataSeries, lastValues, seriesColors, specs, axesSpecs, settingsSpec, serialIdentifierDataSeriesMap, theme, deselectedDataSeries = []) {
    var _a;
    const legendItems = [];
    const defaultColor = theme.colors.defaultVizColor;
    dataSeries.forEach((series) => {
        var _a, _b;
        const { specId, yAccessor } = series;
        const banded = (0, series_1.isBandedSpec)(series.spec);
        const key = (0, series_1.getSeriesKey)(series, series.groupId);
        const spec = (0, spec_1.getSpecsById)(specs, specId);
        const dataSeriesKey = (0, series_1.getSeriesKey)({
            specId: series.specId,
            yAccessor: series.yAccessor,
            splitAccessors: series.splitAccessors,
        }, series.groupId);
        const color = seriesColors.get(dataSeriesKey) || defaultColor;
        const hasSingleSeries = dataSeries.length === 1;
        const name = (0, series_1.getSeriesName)(series, hasSingleSeries, false, spec);
        const isSeriesHidden = deselectedDataSeries && (0, series_1.getSeriesIndex)(deselectedDataSeries, series) >= 0;
        if (name === '' || !spec)
            return;
        const postFixes = getPostfix(spec);
        const labelY1 = banded ? getBandedLegendItemLabel(name, geometry_1.BandedAccessorType.Y1, postFixes) : name;
        const { yAxis } = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, spec.groupId, settingsSpec.rotation);
        const formatter = (_b = (_a = spec.tickFormat) !== null && _a !== void 0 ? _a : yAxis === null || yAxis === void 0 ? void 0 : yAxis.tickFormat) !== null && _b !== void 0 ? _b : axis_utils_1.defaultTickFormatter;
        const { hideInLegend } = spec;
        const lastValue = lastValues.get(key);
        const seriesIdentifier = (0, series_1.getSeriesIdentifierFromDataSeries)(series);
        const xScaleType = (0, get_api_scales_1.getXScaleTypeFromSpec)(spec.xScaleType);
        const pointStyle = getPointStyle(spec, theme);
        legendItems.push({
            color,
            label: labelY1,
            seriesIdentifiers: [seriesIdentifier],
            childId: geometry_1.BandedAccessorType.Y1,
            isSeriesHidden,
            isItemHidden: hideInLegend,
            isToggleable: true,
            defaultExtra: getLegendExtra(settingsSpec.showLegendExtra, xScaleType, formatter, 'y1', lastValue),
            path: [{ index: 0, value: seriesIdentifier.key }],
            keys: [specId, spec.groupId, yAccessor, ...series.splitAccessors.values()],
            pointStyle,
        });
        if (banded) {
            const labelY0 = getBandedLegendItemLabel(name, geometry_1.BandedAccessorType.Y0, postFixes);
            legendItems.push({
                color,
                label: labelY0,
                seriesIdentifiers: [seriesIdentifier],
                childId: geometry_1.BandedAccessorType.Y0,
                isSeriesHidden,
                isItemHidden: hideInLegend,
                isToggleable: true,
                defaultExtra: getLegendExtra(settingsSpec.showLegendExtra, xScaleType, formatter, 'y0', lastValue),
                path: [{ index: 0, value: seriesIdentifier.key }],
                keys: [specId, spec.groupId, yAccessor, ...series.splitAccessors.values()],
                pointStyle,
            });
        }
    });
    const legendSortFn = (0, series_sort_1.getLegendCompareFn)((a, b) => {
        const aDs = serialIdentifierDataSeriesMap[a.key];
        const bDs = serialIdentifierDataSeriesMap[b.key];
        return (0, default_series_sort_fn_1.defaultXYLegendSeriesSort)(aDs, bDs);
    });
    const sortFn = (_a = settingsSpec.legendSort) !== null && _a !== void 0 ? _a : legendSortFn;
    return (0, group_data_series_1.groupBy)(legendItems.sort((a, b) => a.seriesIdentifiers[0] && b.seriesIdentifiers[0] ? sortFn(a.seriesIdentifiers[0], b.seriesIdentifiers[0]) : 0), ({ keys, childId }) => {
        return [...keys, childId].join('__');
    }, true)
        .map((d) => {
        if (!d[0])
            return;
        return {
            ...d[0],
            seriesIdentifiers: d.map(({ seriesIdentifiers: [s] }) => s).filter(common_1.isDefined),
            path: d.map(({ path: [p] }) => p).filter(common_1.isDefined),
        };
    })
        .filter(common_1.isDefined);
}
exports.computeLegend = computeLegend;
//# sourceMappingURL=legend.js.map