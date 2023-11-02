"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugStateSelector = void 0;
const compute_chart_element_sizes_1 = require("./compute_chart_element_sizes");
const compute_legend_1 = require("./compute_legend");
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const get_highlighted_area_1 = require("./get_highlighted_area");
const get_per_panel_heatmap_geometries_1 = require("./get_per_panel_heatmap_geometries");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const common_1 = require("../../../../utils/common");
exports.getDebugStateSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries,
    compute_legend_1.computeLegendSelector,
    get_highlighted_area_1.getHighlightedAreaSelector,
    get_highlighted_area_1.getHighlightedDataSelector,
    get_chart_theme_1.getChartThemeSelector,
    compute_chart_element_sizes_1.computeChartElementSizesSelector,
    get_heatmap_spec_1.getHeatmapSpecSelector,
], (geoms, legend, pickedArea, highlightedData, { heatmap }, { xAxisTickCadence }, { xAxisTitle, yAxisTitle }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const heatmapViewModel = geoms.heatmapViewModels[0];
    const xAxisValues = (_a = heatmapViewModel === null || heatmapViewModel === void 0 ? void 0 : heatmapViewModel.xValues.filter((_, i) => i % xAxisTickCadence === 0)) !== null && _a !== void 0 ? _a : [];
    return {
        legend: getLegendState(legend),
        axes: {
            x: [
                {
                    id: 'x',
                    position: common_1.Position.Left,
                    labels: xAxisValues.map(({ text }) => text),
                    values: xAxisValues.map(({ value }) => value),
                    gridlines: ((_c = (_b = heatmapViewModel === null || heatmapViewModel === void 0 ? void 0 : heatmapViewModel.gridLines) === null || _b === void 0 ? void 0 : _b.x) !== null && _c !== void 0 ? _c : []).map((line) => ({ x: line.x1, y: line.y2 })),
                    ...(xAxisTitle ? { title: xAxisTitle } : {}),
                },
            ],
            y: [
                {
                    id: 'y',
                    position: common_1.Position.Bottom,
                    labels: ((_d = heatmapViewModel === null || heatmapViewModel === void 0 ? void 0 : heatmapViewModel.yValues) !== null && _d !== void 0 ? _d : []).map(({ text }) => text),
                    values: ((_e = heatmapViewModel === null || heatmapViewModel === void 0 ? void 0 : heatmapViewModel.yValues) !== null && _e !== void 0 ? _e : []).map(({ value }) => value),
                    gridlines: ((_g = (_f = heatmapViewModel === null || heatmapViewModel === void 0 ? void 0 : heatmapViewModel.gridLines) === null || _f === void 0 ? void 0 : _f.y) !== null && _g !== void 0 ? _g : []).map((line) => ({ x: line.x2, y: line.y1 })),
                    ...(yAxisTitle ? { title: yAxisTitle } : {}),
                },
            ],
        },
        heatmap: {
            cells: geoms.heatmapViewModels.flatMap((vm) => vm.cells.map((cell) => ({
                x: cell.x,
                y: cell.y,
                datum: cell.datum,
                fill: (0, color_library_wrappers_1.RGBATupleToString)(cell.fill.color),
                formatted: cell.formatted,
                value: cell.value,
                valueShown: heatmap.cell.label.visible && Number.isFinite(vm.cellFontSize(cell)),
            }))),
            selection: {
                area: pickedArea,
                data: highlightedData,
            },
        },
    };
});
function getLegendState(legendItems) {
    const items = legendItems
        .filter(({ isSeriesHidden }) => !isSeriesHidden)
        .map(({ label: name, color, seriesIdentifiers: [seriesIdentifier] }) => {
        var _a;
        return ({
            key: (_a = seriesIdentifier === null || seriesIdentifier === void 0 ? void 0 : seriesIdentifier.key) !== null && _a !== void 0 ? _a : '',
            name,
            color,
        });
    });
    return { items };
}
//# sourceMappingURL=get_debug_state.js.map