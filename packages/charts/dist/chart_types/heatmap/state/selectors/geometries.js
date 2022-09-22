"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatmapGeometries = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var scenegraph_1 = require("../../layout/viewmodel/scenegraph");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var get_color_scale_1 = require("./get_color_scale");
var get_heatmap_spec_1 = require("./get_heatmap_spec");
var get_heatmap_table_1 = require("./get_heatmap_table");
var is_empty_1 = require("./is_empty");
var getDeselectedSeriesSelector = function (state) { return state.interactions.deselectedDataSeries; };
exports.getHeatmapGeometries = (0, create_selector_1.createCustomCachedSelector)([
    get_heatmap_spec_1.getHeatmapSpecSelector,
    compute_chart_dimensions_1.computeChartElementSizesSelector,
    get_heatmap_table_1.getHeatmapTableSelector,
    get_color_scale_1.getColorScale,
    getDeselectedSeriesSelector,
    get_chart_theme_1.getChartThemeSelector,
    is_empty_1.isEmptySelector,
], function (heatmapSpec, dims, heatmapTable, _a, deselectedSeries, theme, empty) {
    var bands = _a.bands, colorScale = _a.scale;
    var disabledBandLabels = new Set(deselectedSeries.map(function (_a) {
        var specId = _a.specId;
        return specId;
    }));
    var bandsToHide = bands
        .filter(function (_a) {
        var label = _a.label;
        return disabledBandLabels.has(label);
    })
        .map(function (_a) {
        var start = _a.start, end = _a.end;
        return [start, end];
    });
    return heatmapSpec && !empty
        ? (0, scenegraph_1.render)(heatmapSpec, dims, heatmapTable, colorScale, bandsToHide, theme)
        : (0, viewmodel_types_1.nullShapeViewModel)();
});
//# sourceMappingURL=geometries.js.map