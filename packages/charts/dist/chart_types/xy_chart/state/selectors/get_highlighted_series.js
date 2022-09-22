"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedSeriesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var compute_legend_1 = require("./compute_legend");
var getHighlightedLegendPath = function (state) { return state.interactions.highlightedLegendPath; };
exports.getHighlightedSeriesSelector = (0, create_selector_1.createCustomCachedSelector)([getHighlightedLegendPath, compute_legend_1.computeLegendSelector], function (highlightedLegendPaths, legendItems) {
    if (highlightedLegendPaths.length > 0) {
        var lookup_1 = new Set(highlightedLegendPaths.map(function (_a) {
            var value = _a.value;
            return value;
        }));
        return legendItems.find(function (_a) {
            var seriesIdentifiers = _a.seriesIdentifiers;
            return seriesIdentifiers.some(function (_a) {
                var key = _a.key;
                return lookup_1.has(key);
            });
        });
    }
});
//# sourceMappingURL=get_highlighted_series.js.map