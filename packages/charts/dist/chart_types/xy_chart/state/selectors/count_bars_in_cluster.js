"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countBarsInCluster = exports.countBarsInClusterSelector = void 0;
const compute_series_domains_1 = require("./compute_series_domains");
const is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const group_data_series_1 = require("../../utils/group_data_series");
const utils_1 = require("../utils/utils");
exports.countBarsInClusterSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector, is_histogram_mode_enabled_1.isHistogramModeEnabledSelector], countBarsInCluster);
function countBarsInCluster({ formattedDataSeries }, isHistogramEnabled) {
    const barDataSeries = formattedDataSeries.filter(({ seriesType }) => seriesType === specs_1.SeriesType.Bar);
    const dataSeriesGroupedByPanel = (0, group_data_series_1.groupBy)(barDataSeries, ['smVerticalAccessorValue', 'smHorizontalAccessorValue'], false);
    const barIndexByPanel = Object.keys(dataSeriesGroupedByPanel).reduce((acc, panelKey) => {
        var _a;
        const panelBars = (_a = dataSeriesGroupedByPanel[panelKey]) !== null && _a !== void 0 ? _a : [];
        const barDataSeriesByBarIndex = (0, group_data_series_1.groupBy)(panelBars, (d) => {
            return (0, utils_1.getBarIndexKey)(d, isHistogramEnabled);
        }, false);
        acc[panelKey] = Object.keys(barDataSeriesByBarIndex);
        return acc;
    }, {});
    return Object.values(barIndexByPanel).reduce((acc, curr) => {
        return Math.max(acc, curr.length);
    }, 0);
}
exports.countBarsInCluster = countBarsInCluster;
//# sourceMappingURL=count_bars_in_cluster.js.map