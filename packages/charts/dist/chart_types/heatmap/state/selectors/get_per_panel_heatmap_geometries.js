"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerPanelHeatmapGeometries = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const compute_chart_element_sizes_1 = require("./compute_chart_element_sizes");
const get_color_scale_1 = require("./get_color_scale");
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const get_heatmap_table_1 = require("./get_heatmap_table");
const is_empty_1 = require("./is_empty");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_small_multiples_index_order_1 = require("../../../../state/selectors/get_small_multiples_index_order");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const scenegraph_1 = require("../../layout/viewmodel/scenegraph");
const getDeselectedSeriesSelector = (state) => state.interactions.deselectedDataSeries;
exports.getPerPanelHeatmapGeometries = (0, create_selector_1.createCustomCachedSelector)([
    get_heatmap_spec_1.getHeatmapSpecSelector,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
    compute_chart_element_sizes_1.computeChartElementSizesSelector,
    get_heatmap_table_1.getHeatmapTableSelector,
    get_color_scale_1.getColorScale,
    getDeselectedSeriesSelector,
    get_chart_theme_1.getChartThemeSelector,
    is_empty_1.isEmptySelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    get_small_multiples_index_order_1.getSmallMultiplesIndexOrderSelector,
], (heatmapSpec, chartDimensions, elementSizes, heatmapTable, { bands, scale: colorScale }, deselectedSeries, theme, empty, smScales, groupBySpec) => {
    const disabledBandLabels = new Set(deselectedSeries.map(({ specId }) => specId));
    const bandsToHide = bands
        .filter(({ label }) => disabledBandLabels.has(label))
        .map(({ start, end }) => [start, end]);
    return heatmapSpec && !empty
        ? (0, scenegraph_1.computeScenegraph)(heatmapSpec, chartDimensions, elementSizes, smScales, groupBySpec, heatmapTable, colorScale, bandsToHide, theme)
        : (0, viewmodel_types_1.nullShapeViewModel)();
});
//# sourceMappingURL=get_per_panel_heatmap_geometries.js.map