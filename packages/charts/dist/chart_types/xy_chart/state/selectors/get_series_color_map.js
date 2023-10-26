"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeriesColorsSelector = void 0;
const compute_series_domains_1 = require("./compute_series_domains");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const series_1 = require("../../utils/series");
const utils_1 = require("../utils/utils");
function getColorOverrides({ colors }) {
    return colors;
}
exports.getSeriesColorsSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector, get_chart_theme_1.getChartThemeSelector, getColorOverrides], (seriesDomainsAndData, chartTheme, colorOverrides) => {
    const updatedCustomSeriesColors = (0, utils_1.getCustomSeriesColors)(seriesDomainsAndData.formattedDataSeries);
    return (0, series_1.getSeriesColors)(seriesDomainsAndData.formattedDataSeries, chartTheme.colors, updatedCustomSeriesColors, colorOverrides);
});
//# sourceMappingURL=get_series_color_map.js.map