"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLegendSelector = void 0;
const get_color_scale_1 = require("./get_color_scale");
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const is_empty_1 = require("./is_empty");
const create_selector_1 = require("../../../../state/create_selector");
const get_deselected_data_series_1 = require("../../../../state/selectors/get_deselected_data_series");
const EMPTY_LEGEND = [];
exports.computeLegendSelector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, get_color_scale_1.getColorScale, get_deselected_data_series_1.getDeselectedSeriesSelector, is_empty_1.isEmptySelector], (spec, { bands }, deselectedDataSeries, empty) => {
    if (spec === null || empty) {
        return EMPTY_LEGEND;
    }
    return bands.map(({ label, color }) => {
        return {
            seriesIdentifiers: [{ key: label, specId: label }],
            color,
            label,
            isSeriesHidden: deselectedDataSeries.some(({ key }) => key === label),
            isToggleable: true,
            path: [{ index: 0, value: label }],
            keys: [],
        };
    });
});
//# sourceMappingURL=compute_legend.js.map