"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAnnotationDimensionsSelector = void 0;
const compute_series_geometries_1 = require("./compute_series_geometries");
const get_axis_styles_1 = require("./get_axis_styles");
const get_specs_1 = require("./get_specs");
const is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const utils_1 = require("../../annotations/utils");
const getAxisStyleGetter = (0, create_selector_1.createCustomCachedSelector)([get_axis_styles_1.getAxesStylesSelector, get_chart_theme_1.getChartThemeSelector], (axisStyles, { axes }) => (id = '') => { var _a; return (_a = axisStyles.get(id)) !== null && _a !== void 0 ? _a : axes; });
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