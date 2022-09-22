"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legendHoverHighlightNodes = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var highlighted_geoms_1 = require("../../layout/utils/highlighted_geoms");
var geometries_1 = require("./geometries");
var getHighlightedLegendItemPath = function (state) { return state.interactions.highlightedLegendPath; };
exports.legendHoverHighlightNodes = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, getHighlightedLegendItemPath, geometries_1.partitionMultiGeometries], function (_a, highlightedLegendItemPath, geometries) {
    var legendStrategy = _a.legendStrategy, flatLegend = _a.flatLegend;
    if (highlightedLegendItemPath.length === 0)
        return [];
    return geometries.flatMap(function (_a) {
        var quadViewModel = _a.quadViewModel;
        return (0, highlighted_geoms_1.highlightedGeoms)(legendStrategy, flatLegend, quadViewModel, highlightedLegendItemPath);
    });
});
//# sourceMappingURL=get_highlighted_shapes.js.map