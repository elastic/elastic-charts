"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedAreaSelector = exports.getHighlightedDataSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var geometries_1 = require("./geometries");
var get_heatmap_spec_1 = require("./get_heatmap_spec");
var is_brushing_1 = require("./is_brushing");
exports.getHighlightedDataSelector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, is_brushing_1.isBrushingSelector], function (spec, isBrushing) {
    if (!spec.highlightedData || isBrushing) {
        return null;
    }
    return spec.highlightedData;
});
exports.getHighlightedAreaSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.getHeatmapGeometries, get_heatmap_spec_1.getHeatmapSpecSelector, is_brushing_1.isBrushingSelector], function (geoms, spec, isBrushing) {
    if (!spec.highlightedData || isBrushing) {
        return null;
    }
    return geoms.pickHighlightedArea(spec.highlightedData.x, spec.highlightedData.y);
});
//# sourceMappingURL=get_highlighted_area.js.map