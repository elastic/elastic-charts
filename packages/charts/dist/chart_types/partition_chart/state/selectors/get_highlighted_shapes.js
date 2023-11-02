"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legendHoverHighlightNodes = void 0;
const geometries_1 = require("./geometries");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const highlighted_geoms_1 = require("../../layout/utils/highlighted_geoms");
const getHighlightedLegendItemPath = (state) => state.interactions.highlightedLegendPath;
exports.legendHoverHighlightNodes = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, getHighlightedLegendItemPath, geometries_1.partitionMultiGeometries], ({ legendStrategy, flatLegend }, highlightedLegendItemPath, geometries) => {
    if (highlightedLegendItemPath.length === 0)
        return [];
    return geometries.flatMap(({ quadViewModel }) => (0, highlighted_geoms_1.highlightedGeoms)(legendStrategy, flatLegend, quadViewModel, highlightedLegendItemPath));
});
//# sourceMappingURL=get_highlighted_shapes.js.map