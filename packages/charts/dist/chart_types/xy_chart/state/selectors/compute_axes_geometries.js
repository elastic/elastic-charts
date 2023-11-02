"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAxesGeometriesSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_axis_styles_1 = require("./get_axis_styles");
const get_specs_1 = require("./get_specs");
const visible_ticks_1 = require("./visible_ticks");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const axis_utils_1 = require("../../utils/axis_utils");
exports.computeAxesGeometriesSelector = (0, create_selector_1.createCustomCachedSelector)([
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    get_chart_theme_1.getChartThemeSelector,
    get_specs_1.axisSpecsLookupSelector,
    get_axis_styles_1.getAxesStylesSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    visible_ticks_1.getVisibleTickSetsSelector,
], axis_utils_1.getAxesGeometries);
//# sourceMappingURL=compute_axes_geometries.js.map