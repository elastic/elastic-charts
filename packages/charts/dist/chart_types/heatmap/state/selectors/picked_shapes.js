"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPicketVisibleCells = exports.getPickedGridCell = exports.getPickedShapes = void 0;
const compute_chart_element_sizes_1 = require("./compute_chart_element_sizes");
const get_per_panel_heatmap_geometries_1 = require("./get_per_panel_heatmap_geometries");
const create_selector_1 = require("../../../../state/create_selector");
const get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
exports.getPickedShapes = (0, create_selector_1.createCustomCachedSelector)([get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries, get_active_pointer_position_1.getActivePointerPosition], (geoms, pointerPosition) => {
    const picker = geoms.pickQuads;
    const { x, y } = pointerPosition;
    return picker(x, y);
});
exports.getPickedGridCell = (0, create_selector_1.createCustomCachedSelector)([get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries, get_active_pointer_position_1.getActivePointerPosition, compute_chart_element_sizes_1.computeChartElementSizesSelector], (geoms, pointerPosition) => {
    return geoms.pickGridCell(pointerPosition.x, pointerPosition.y);
});
const hasPicketVisibleCells = (pickedShapes) => Array.isArray(pickedShapes) && pickedShapes.some(({ visible }) => visible);
exports.hasPicketVisibleCells = hasPicketVisibleCells;
//# sourceMappingURL=picked_shapes.js.map