"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAnnotationDimensionsSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var utils_1 = require("../../annotations/utils");
var compute_series_geometries_1 = require("./compute_series_geometries");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var get_axis_styles_1 = require("./get_axis_styles");
var get_specs_1 = require("./get_specs");
var is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
var getAxisStyleGetter = (0, create_selector_1.createCustomCachedSelector)([get_axis_styles_1.getAxesStylesSelector, get_chart_theme_1.getChartThemeSelector], function (axisStyles, _a) {
    var axes = _a.axes;
    return function (id) {
        var _a;
        if (id === void 0) { id = ''; }
        return (_a = axisStyles.get(id)) !== null && _a !== void 0 ? _a : axes;
    };
});
exports.computeAnnotationDimensionsSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_specs_1.getAnnotationSpecsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    compute_series_geometries_1.computeSeriesGeometriesSelector,
    get_specs_1.getAxisSpecsSelector,
    is_histogram_mode_enabled_1.isHistogramModeEnabledSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    getAxisStyleGetter,
], utils_1.computeAnnotationDimensions);
//# sourceMappingURL=compute_annotations.js.map