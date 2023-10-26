"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrushedHighlightedShapesSelector = void 0;
const get_active_pointer_position_1 = require("./../../../../state/selectors/get_active_pointer_position");
const get_per_panel_heatmap_geometries_1 = require("./get_per_panel_heatmap_geometries");
const create_selector_1 = require("../../../../state/create_selector");
function getCurrentPointerStates(state) {
    return state.interactions.pointer;
}
exports.getBrushedHighlightedShapesSelector = (0, create_selector_1.createCustomCachedSelector)([get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries, getCurrentPointerStates, get_active_pointer_position_1.getActivePointerPosition], (geoms, pointerStates, activePosition) => {
    if (!pointerStates.dragging || !pointerStates.down) {
        return null;
    }
    return geoms.pickDragShape([pointerStates.down.position, activePosition]);
});
//# sourceMappingURL=get_brushed_highlighted_shapes.js.map