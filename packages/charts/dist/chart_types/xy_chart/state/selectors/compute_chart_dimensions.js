"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartDimensionsSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_small_multiples_spec_1 = require("../../../../state/selectors/get_small_multiples_spec");
var dimensions_1 = require("../../utils/dimensions");
var compute_axis_ticks_dimensions_1 = require("./compute_axis_ticks_dimensions");
var get_axis_styles_1 = require("./get_axis_styles");
var get_specs_1 = require("./get_specs");
exports.computeChartDimensionsSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_chart_container_dimensions_1.getChartContainerDimensionsSelector,
    get_chart_theme_1.getChartThemeSelector,
    compute_axis_ticks_dimensions_1.computeAxisTicksDimensionsSelector,
    get_axis_styles_1.getAxesStylesSelector,
    get_specs_1.getAxisSpecsSelector,
    get_small_multiples_spec_1.getSmallMultiplesSpec,
], dimensions_1.computeChartDimensions);
//# sourceMappingURL=compute_chart_dimensions.js.map