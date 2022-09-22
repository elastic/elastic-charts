"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeriesColorsSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var series_1 = require("../../utils/series");
var utils_1 = require("../utils/utils");
var compute_series_domains_1 = require("./compute_series_domains");
function getColorOverrides(_a) {
    var colors = _a.colors;
    return colors;
}
exports.getSeriesColorsSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector, get_chart_theme_1.getChartThemeSelector, getColorOverrides], function (seriesDomainsAndData, chartTheme, colorOverrides) {
    var updatedCustomSeriesColors = (0, utils_1.getCustomSeriesColors)(seriesDomainsAndData.formattedDataSeries);
    return (0, series_1.getSeriesColors)(seriesDomainsAndData.formattedDataSeries, chartTheme.colors, updatedCustomSeriesColors, colorOverrides);
});
//# sourceMappingURL=get_series_color_map.js.map