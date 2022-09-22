"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLegendSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_deselected_data_series_1 = require("../../../../state/selectors/get_deselected_data_series");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var legend_1 = require("../../legend/legend");
var get_last_value_1 = require("../utils/get_last_value");
var compute_series_domains_1 = require("./compute_series_domains");
var get_series_color_map_1 = require("./get_series_color_map");
var get_si_dataseries_map_1 = require("./get_si_dataseries_map");
var get_specs_1 = require("./get_specs");
exports.computeLegendSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_specs_1.getSeriesSpecsSelector,
    compute_series_domains_1.computeSeriesDomainsSelector,
    get_chart_theme_1.getChartThemeSelector,
    get_series_color_map_1.getSeriesColorsSelector,
    get_specs_1.getAxisSpecsSelector,
    get_deselected_data_series_1.getDeselectedSeriesSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    get_si_dataseries_map_1.getSiDataSeriesMapSelector,
], function (seriesSpecs, _a, chartTheme, seriesColors, axesSpecs, deselectedDataSeries, settings, siDataSeriesMap) {
    var formattedDataSeries = _a.formattedDataSeries, xDomain = _a.xDomain;
    return (0, legend_1.computeLegend)(formattedDataSeries, (0, get_last_value_1.getLastValues)(formattedDataSeries, xDomain), seriesColors, seriesSpecs, axesSpecs, settings, siDataSeriesMap, chartTheme, deselectedDataSeries);
});
//# sourceMappingURL=compute_legend.js.map