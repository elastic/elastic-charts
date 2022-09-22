"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSeriesGeometriesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
var utils_1 = require("../utils/utils");
var compute_axis_ticks_dimensions_1 = require("./compute_axis_ticks_dimensions");
var compute_series_domains_1 = require("./compute_series_domains");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var get_series_color_map_1 = require("./get_series_color_map");
var get_specs_1 = require("./get_specs");
var is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
exports.computeSeriesGeometriesSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_specs_1.getSeriesSpecsSelector,
    compute_series_domains_1.computeSeriesDomainsSelector,
    get_series_color_map_1.getSeriesColorsSelector,
    get_chart_theme_1.getChartThemeSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    get_specs_1.getAxisSpecsSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    is_histogram_mode_enabled_1.isHistogramModeEnabledSelector,
    compute_axis_ticks_dimensions_1.getFallBackTickFormatter,
], function (specs, domain, colors, theme, settings, axis, smScales, isHistogram, fallbackFormatter) {
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)(function (measureText) {
        return (0, utils_1.computeSeriesGeometries)(specs, domain, colors, theme, settings, axis, smScales, isHistogram, fallbackFormatter, measureText);
    });
});
//# sourceMappingURL=compute_series_geometries.js.map