"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrushedHighlightedShapesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_active_pointer_position_1 = require("./../../../../state/selectors/get_active_pointer_position");
var geometries_1 = require("./geometries");
function getCurrentPointerStates(state) {
    return state.interactions.pointer;
}
exports.getBrushedHighlightedShapesSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.getHeatmapGeometries, getCurrentPointerStates, get_active_pointer_position_1.getActivePointerPosition], function (geoms, pointerStates, activePosition) {
    if (!pointerStates.dragging || !pointerStates.down) {
        return null;
    }
    return geoms.pickDragShape([pointerStates.down.position, activePosition]);
});
//# sourceMappingURL=get_brushed_highlighted_shapes.js.map