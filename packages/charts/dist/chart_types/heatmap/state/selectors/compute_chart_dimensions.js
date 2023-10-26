"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartDimensionsSelector = void 0;
const compute_axes_sizes_1 = require("./compute_axes_sizes");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const getParentDimension = (state) => state.parentDimensions;
exports.computeChartDimensionsSelector = (0, create_selector_1.createCustomCachedSelector)([getParentDimension, compute_axes_sizes_1.computeAxesSizesSelector, get_chart_theme_1.getChartThemeSelector], (parentDimensions, axesSizes, { heatmap, chartPaddings }) => {
    const chartHeight = parentDimensions.height -
        axesSizes.xAxisTitleVerticalSize -
        axesSizes.xAxisPanelTitleVerticalSize -
        axesSizes.xAxis.height -
        axesSizes.legendHeight -
        heatmap.grid.stroke.width / 2;
    const { chartWidth } = axesSizes;
    return {
        leftMargin: NaN,
        chartDimensions: {
            top: parentDimensions.top + heatmap.grid.stroke.width / 2 + chartPaddings.top,
            left: parentDimensions.left + axesSizes.xAxis.left + chartPaddings.left,
            width: Math.max(0, chartWidth - chartPaddings.left - chartPaddings.right),
            height: Math.max(0, chartHeight - chartPaddings.top - chartPaddings.bottom),
        },
    };
});
//# sourceMappingURL=compute_chart_dimensions.js.map