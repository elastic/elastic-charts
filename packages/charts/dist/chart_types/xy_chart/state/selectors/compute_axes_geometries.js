"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAxesGeometriesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var axis_utils_1 = require("../../utils/axis_utils");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var count_bars_in_cluster_1 = require("./count_bars_in_cluster");
var get_axis_styles_1 = require("./get_axis_styles");
var get_specs_1 = require("./get_specs");
var is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
var visible_ticks_1 = require("./visible_ticks");
exports.computeAxesGeometriesSelector = (0, create_selector_1.createCustomCachedSelector)([
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_chart_theme_1.getChartThemeSelector,
    get_specs_1.axisSpecsLookupSelector,
    get_axis_styles_1.getAxesStylesSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    count_bars_in_cluster_1.countBarsInClusterSelector,
    is_histogram_mode_enabled_1.isHistogramModeEnabledSelector,
    visible_ticks_1.getVisibleTickSetsSelector,
], axis_utils_1.getAxesGeometries);
//# sourceMappingURL=compute_axes_geometries.js.map