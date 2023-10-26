"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickedCells = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const get_per_panel_heatmap_geometries_1 = require("./get_per_panel_heatmap_geometries");
const create_selector_1 = require("../../../../state/create_selector");
const get_last_drag_1 = require("../../../../state/selectors/get_last_drag");
exports.getPickedCells = (0, create_selector_1.createCustomCachedSelector)([get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries, get_last_drag_1.getLastDragSelector, compute_chart_dimensions_1.computeChartDimensionsSelector], (geoms, dragState, { chartDimensions }) => {
    if (!dragState) {
        return null;
    }
    if (dragState.start.position.x < chartDimensions.left && dragState.end.position.x < chartDimensions.left) {
        const fittedDragStateStart = { x: chartDimensions.left, y: dragState.start.position.y };
        const { y, cells } = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]);
        return { x: [], y, cells };
    }
    if (dragState.start.position.y > chartDimensions.height && dragState.end.position.y > chartDimensions.height) {
        const fittedDragStateStart = { x: dragState.start.position.x, y: chartDimensions.height };
        const { x, cells } = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]);
        return { x, y: [], cells };
    }
    return geoms.pickDragArea([dragState.start.position, dragState.end.position]);
});
//# sourceMappingURL=get_picked_cells.js.map