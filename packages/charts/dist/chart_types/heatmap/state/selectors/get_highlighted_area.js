"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedAreaSelector = exports.getHighlightedDataSelector = void 0;
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const get_per_panel_heatmap_geometries_1 = require("./get_per_panel_heatmap_geometries");
const create_selector_1 = require("../../../../state/create_selector");
const is_brushing_1 = require("../../../../state/selectors/is_brushing");
exports.getHighlightedDataSelector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, is_brushing_1.isBrushingSelector], (spec, isBrushing) => {
    if (!spec.highlightedData || isBrushing) {
        return null;
    }
    return spec.highlightedData;
});
exports.getHighlightedAreaSelector = (0, create_selector_1.createCustomCachedSelector)([get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries, get_heatmap_spec_1.getHeatmapSpecSelector, is_brushing_1.isBrushingSelector], (geoms, spec, isBrushing) => {
    if (!spec.highlightedData || isBrushing) {
        return null;
    }
    const { x, y, smHorizontalAccessorValue, smVerticalAccessorValue } = spec.highlightedData;
    return geoms.pickHighlightedArea(x, y, smHorizontalAccessorValue, smVerticalAccessorValue);
});
//# sourceMappingURL=get_highlighted_area.js.map