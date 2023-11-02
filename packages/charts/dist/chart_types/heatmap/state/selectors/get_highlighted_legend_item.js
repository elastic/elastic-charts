"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedLegendItemSelector = void 0;
const compute_legend_1 = require("./compute_legend");
const create_selector_1 = require("../../../../state/create_selector");
const getHighlightedLegendPath = (state) => state.interactions.highlightedLegendPath;
exports.getHighlightedLegendItemSelector = (0, create_selector_1.createCustomCachedSelector)([getHighlightedLegendPath, compute_legend_1.computeLegendSelector], (highlightedLegendPaths, legendItems) => {
    if (highlightedLegendPaths.length > 0) {
        const lookup = new Set(highlightedLegendPaths.map(({ value }) => value));
        return legendItems.find(({ seriesIdentifiers }) => seriesIdentifiers.some(({ key }) => lookup.has(key)));
    }
});
//# sourceMappingURL=get_highlighted_legend_item.js.map