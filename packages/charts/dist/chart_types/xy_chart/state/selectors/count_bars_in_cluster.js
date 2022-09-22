"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countBarsInCluster = exports.countBarsInClusterSelector = void 0;
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var group_data_series_1 = require("../../utils/group_data_series");
var utils_1 = require("../utils/utils");
var compute_series_domains_1 = require("./compute_series_domains");
var is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
exports.countBarsInClusterSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector, is_histogram_mode_enabled_1.isHistogramModeEnabledSelector], countBarsInCluster);
function countBarsInCluster(_a, isHistogramEnabled) {
    var formattedDataSeries = _a.formattedDataSeries;
    var barDataSeries = formattedDataSeries.filter(function (_a) {
        var seriesType = _a.seriesType;
        return seriesType === specs_1.SeriesType.Bar;
    });
    var dataSeriesGroupedByPanel = (0, group_data_series_1.groupBy)(barDataSeries, ['smVerticalAccessorValue', 'smHorizontalAccessorValue'], false);
    var barIndexByPanel = Object.keys(dataSeriesGroupedByPanel).reduce(function (acc, panelKey) {
        var panelBars = dataSeriesGroupedByPanel[panelKey];
        var barDataSeriesByBarIndex = (0, group_data_series_1.groupBy)(panelBars, function (d) {
            return (0, utils_1.getBarIndexKey)(d, isHistogramEnabled);
        }, false);
        acc[panelKey] = Object.keys(barDataSeriesByBarIndex);
        return acc;
    }, {});
    return Object.values(barIndexByPanel).reduce(function (acc, curr) {
        return Math.max(acc, curr.length);
    }, 0);
}
exports.countBarsInCluster = countBarsInCluster;
//# sourceMappingURL=count_bars_in_cluster.js.map