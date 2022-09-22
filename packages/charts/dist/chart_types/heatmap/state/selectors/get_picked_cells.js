"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickedCells = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_last_drag_1 = require("../../../../state/selectors/get_last_drag");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var geometries_1 = require("./geometries");
exports.getPickedCells = (0, create_selector_1.createCustomCachedSelector)([geometries_1.getHeatmapGeometries, get_last_drag_1.getLastDragSelector, compute_chart_dimensions_1.computeChartElementSizesSelector], function (geoms, dragState, dims) {
    if (!dragState) {
        return null;
    }
    if (dragState.start.position.x < dims.grid.left && dragState.end.position.x < dims.grid.left) {
        var fittedDragStateStart = { x: dims.grid.left, y: dragState.start.position.y };
        var _a = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]), y = _a.y, cells = _a.cells;
        return { x: [], y: y, cells: cells };
    }
    if (dragState.start.position.y > dims.grid.height && dragState.end.position.y > dims.grid.height) {
        var fittedDragStateStart = { x: dragState.start.position.x, y: dims.grid.height };
        var _b = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]), x = _b.x, cells = _b.cells;
        return { x: x, y: [], cells: cells };
    }
    return geoms.pickDragArea([dragState.start.position, dragState.end.position]);
});
//# sourceMappingURL=get_picked_cells.js.map