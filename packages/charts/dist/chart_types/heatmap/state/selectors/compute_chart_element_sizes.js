"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartElementSizesSelector = void 0;
const compute_axes_sizes_1 = require("./compute_axes_sizes");
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const panel_utils_1 = require("../../../../common/panel_utils");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
exports.computeChartElementSizesSelector = (0, create_selector_1.createCustomCachedSelector)([compute_chart_dimensions_1.computeChartDimensionsSelector, compute_axes_sizes_1.computeAxesSizesSelector, get_chart_theme_1.getChartThemeSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], ({ chartDimensions }, axesSizes, { heatmap }, smScales) => {
    const panelHeight = (0, panel_utils_1.getPanelSize)(smScales).height;
    const grid = {
        width: axesSizes.xAxis.width,
        height: panelHeight,
        left: chartDimensions.left + axesSizes.xAxis.left,
        top: chartDimensions.top + heatmap.grid.stroke.width / 2,
    };
    const yAxis = {
        width: axesSizes.yAxis.width,
        height: grid.height,
        top: grid.top,
        left: grid.left - axesSizes.yAxis.width,
    };
    const xAxis = {
        width: grid.width,
        height: axesSizes.xAxis.height,
        top: grid.top + grid.height,
        left: grid.left,
    };
    return {
        yAxis,
        xAxis,
        xAxisTickCadence: axesSizes.xAxis.tickCadence,
        xLabelRotation: axesSizes.xAxis.minRotation,
    };
});
//# sourceMappingURL=compute_chart_element_sizes.js.map