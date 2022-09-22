"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugStateSelector = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var create_selector_1 = require("../../../../state/create_selector");
var common_1 = require("../../../../utils/common");
var get_chart_theme_1 = require("./../../../../state/selectors/get_chart_theme");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_legend_1 = require("./compute_legend");
var geometries_1 = require("./geometries");
var get_highlighted_area_1 = require("./get_highlighted_area");
exports.getDebugStateSelector = (0, create_selector_1.createCustomCachedSelector)([
    geometries_1.getHeatmapGeometries,
    compute_legend_1.computeLegendSelector,
    get_highlighted_area_1.getHighlightedAreaSelector,
    get_highlighted_area_1.getHighlightedDataSelector,
    get_chart_theme_1.getChartThemeSelector,
    compute_chart_dimensions_1.computeChartElementSizesSelector,
], function (geoms, legend, pickedArea, highlightedData, _a, _b) {
    var heatmap = _a.heatmap;
    var xAxisTickCadence = _b.xAxisTickCadence;
    var xAxisValues = geoms.heatmapViewModel.xValues.filter(function (_, i) { return i % xAxisTickCadence === 0; });
    return {
        legend: getLegendState(legend),
        axes: {
            x: [
                {
                    id: 'x',
                    position: common_1.Position.Left,
                    labels: xAxisValues.map(function (_a) {
                        var text = _a.text;
                        return text;
                    }),
                    values: xAxisValues.map(function (_a) {
                        var value = _a.value;
                        return value;
                    }),
                    gridlines: geoms.heatmapViewModel.gridLines.x.map(function (line) { return ({ x: line.x1, y: line.y2 }); }),
                },
            ],
            y: [
                {
                    id: 'y',
                    position: common_1.Position.Bottom,
                    labels: geoms.heatmapViewModel.yValues.map(function (_a) {
                        var text = _a.text;
                        return text;
                    }),
                    values: geoms.heatmapViewModel.yValues.map(function (_a) {
                        var value = _a.value;
                        return value;
                    }),
                    gridlines: geoms.heatmapViewModel.gridLines.y.map(function (line) { return ({ x: line.x2, y: line.y1 }); }),
                },
            ],
        },
        heatmap: {
            cells: geoms.heatmapViewModel.cells.map(function (cell) { return ({
                x: cell.x,
                y: cell.y,
                fill: (0, color_library_wrappers_1.RGBATupleToString)(cell.fill.color),
                formatted: cell.formatted,
                value: cell.value,
                valueShown: heatmap.cell.label.visible && Number.isFinite(geoms.heatmapViewModel.cellFontSize(cell)),
            }); }),
            selection: {
                area: pickedArea,
                data: highlightedData,
            },
        },
    };
});
function getLegendState(legendItems) {
    var items = legendItems
        .filter(function (_a) {
        var isSeriesHidden = _a.isSeriesHidden;
        return !isSeriesHidden;
    })
        .map(function (_a) {
        var name = _a.label, color = _a.color, _b = __read(_a.seriesIdentifiers, 1), key = _b[0].key;
        return ({
            key: key,
            name: name,
            color: color,
        });
    });
    return { items: items };
}
//# sourceMappingURL=get_debug_state.js.map