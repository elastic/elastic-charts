"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartDimensionsSelector = void 0;
const compute_axis_ticks_dimensions_1 = require("./compute_axis_ticks_dimensions");
const get_axis_styles_1 = require("./get_axis_styles");
const get_specs_1 = require("./get_specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_small_multiples_spec_1 = require("../../../../state/selectors/get_small_multiples_spec");
const dimensions_1 = require("../../utils/dimensions");
exports.computeChartDimensionsSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_chart_container_dimensions_1.getChartContainerDimensionsSelector,
    get_chart_theme_1.getChartThemeSelector,
    compute_axis_ticks_dimensions_1.computeAxisTicksDimensionsSelector,
    get_axis_styles_1.getAxesStylesSelector,
    get_specs_1.getAxisSpecsSelector,
    get_small_multiples_spec_1.getSmallMultiplesSpec,
], dimensions_1.computeChartDimensions);
//# sourceMappingURL=compute_chart_dimensions.js.map