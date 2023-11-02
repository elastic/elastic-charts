"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedLegendBandsSelector = void 0;
const get_color_scale_1 = require("./get_color_scale");
const get_highlighted_legend_item_1 = require("./get_highlighted_legend_item");
const create_selector_1 = require("../../../../state/create_selector");
exports.getHighlightedLegendBandsSelector = (0, create_selector_1.createCustomCachedSelector)([get_highlighted_legend_item_1.getHighlightedLegendItemSelector, get_color_scale_1.getColorScale], (highlightedLegendItem, { bands }) => {
    if (!highlightedLegendItem)
        return [];
    return bands.filter(({ label }) => highlightedLegendItem.label === label).map(({ start, end }) => [start, end]);
});
//# sourceMappingURL=get_highlighted_legend_bands.js.map