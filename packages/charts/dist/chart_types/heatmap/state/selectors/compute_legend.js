"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLegendSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_deselected_data_series_1 = require("../../../../state/selectors/get_deselected_data_series");
var get_color_scale_1 = require("./get_color_scale");
var heatmap_spec_1 = require("./heatmap_spec");
var is_empty_1 = require("./is_empty");
var EMPTY_LEGEND = [];
exports.computeLegendSelector = (0, create_selector_1.createCustomCachedSelector)([heatmap_spec_1.getSpecOrNull, get_color_scale_1.getColorScale, get_deselected_data_series_1.getDeselectedSeriesSelector, is_empty_1.isEmptySelector], function (spec, _a, deselectedDataSeries, empty) {
    var bands = _a.bands;
    if (spec === null || empty) {
        return EMPTY_LEGEND;
    }
    return bands.map(function (_a) {
        var label = _a.label, color = _a.color;
        return {
            seriesIdentifiers: [{ key: label, specId: label }],
            color: color,
            label: label,
            isSeriesHidden: deselectedDataSeries.some(function (_a) {
                var key = _a.key;
                return key === label;
            }),
            isToggleable: true,
            path: [{ index: 0, value: label }],
            keys: [],
        };
    });
});
//# sourceMappingURL=compute_legend.js.map