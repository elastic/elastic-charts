"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAxesSizesSelector = void 0;
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const get_heatmap_table_1 = require("./get_heatmap_table");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_sm_domains_1 = require("../../../../state/selectors/get_internal_sm_domains");
const get_legend_size_1 = require("../../../../state/selectors/get_legend_size");
const get_small_multiples_spec_1 = require("../../../../state/selectors/get_small_multiples_spec");
const canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
const legend_1 = require("../../../../utils/legend");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
const axis_1 = require("../utils/axis");
const getParentDimension = (state) => state.parentDimensions;
exports.computeAxesSizesSelector = (0, create_selector_1.createCustomCachedSelector)([
    getParentDimension,
    get_legend_size_1.getLegendSizeSelector,
    get_heatmap_table_1.getHeatmapTableSelector,
    get_chart_theme_1.getChartThemeSelector,
    get_heatmap_spec_1.getHeatmapSpecSelector,
    get_small_multiples_spec_1.getSmallMultiplesSpec,
    get_internal_sm_domains_1.getInternalSmallMultiplesDomains,
], (container, legendSize, { yValues, xValues }, { heatmap, axes: { axisTitle: axisTitleStyle, axisPanelTitle: axisPanelTitleStyle } }, { xAxisTitle, yAxisTitle, xAxisLabelFormatter, yAxisLabelFormatter, xScale }, smSpec, { smHDomain }) => {
    var _a;
    const panelWidth = (0, compute_small_multiple_scales_1.getScale)(smHDomain, container.width, (_a = smSpec === null || smSpec === void 0 ? void 0 : smSpec.style) === null || _a === void 0 ? void 0 : _a.horizontalPanelPadding).bandwidth;
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)((textMeasure) => {
        var _a;
        const isLegendHorizontal = (0, legend_1.isHorizontalLegend)(legendSize.position);
        const legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
        const legendHeight = isLegendHorizontal
            ? (_a = heatmap.maxLegendHeight) !== null && _a !== void 0 ? _a : legendSize.height + legendSize.margin * 2
            : 0;
        const yAxisTitleHorizontalSize = (0, axis_1.getTextSizeDimension)(yAxisTitle, axisTitleStyle, textMeasure, 'height');
        const yAxisPanelTitleHorizontalSize = (0, axis_1.getTextSizeDimension)(yAxisTitle, axisPanelTitleStyle, textMeasure, 'height', !(smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitVertically));
        const yAxis = {
            width: (0, axis_1.getYAxisHorizontalUsedSpace)(yValues, heatmap.yAxisLabel, yAxisLabelFormatter, textMeasure),
        };
        const xAxisTitleVerticalSize = (0, axis_1.getTextSizeDimension)(xAxisTitle, axisTitleStyle, textMeasure, 'height');
        const xAxisPanelTitleVerticalSize = (0, axis_1.getTextSizeDimension)(xAxisTitle, axisPanelTitleStyle, textMeasure, 'height', !(smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitHorizontally));
        const xAxis = (0, axis_1.getXAxisSize)(!(0, viewmodel_1.isRasterTimeScale)(xScale), heatmap.xAxisLabel, xAxisLabelFormatter, xValues, textMeasure, panelWidth - legendWidth - heatmap.grid.stroke.width / 2, [
            yAxisTitleHorizontalSize + yAxisPanelTitleHorizontalSize + yAxis.width,
            0,
        ]);
        const chartWidth = (0, axis_1.getXAxisSize)(!(0, viewmodel_1.isRasterTimeScale)(xScale), heatmap.xAxisLabel, xAxisLabelFormatter, xValues, textMeasure, container.width - legendWidth - heatmap.grid.stroke.width / 2, [
            yAxisTitleHorizontalSize + yAxisPanelTitleHorizontalSize + yAxis.width,
            0,
        ]).width;
        return {
            yAxis,
            xAxis,
            legendHeight,
            xAxisTitleVerticalSize,
            xAxisPanelTitleVerticalSize,
            chartWidth,
        };
    });
});
//# sourceMappingURL=compute_axes_sizes.js.map