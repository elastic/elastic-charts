"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickedGridCell = exports.getPickedShapes = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var geometries_1 = require("./geometries");
exports.getPickedShapes = (0, create_selector_1.createCustomCachedSelector)([geometries_1.getHeatmapGeometries, get_active_pointer_position_1.getActivePointerPosition, compute_chart_dimensions_1.computeChartElementSizesSelector], function (geoms, pointerPosition, dims) {
    var picker = geoms.pickQuads;
    var x = pointerPosition.x, y = pointerPosition.y;
    var pickedData = picker(x, y);
    return Array.isArray(pickedData)
        ? pickedData.filter(function (_a) {
            var y = _a.y;
            return y < dims.rowHeight * dims.visibleNumberOfRows;
        })
        : pickedData;
});
exports.getPickedGridCell = (0, create_selector_1.createCustomCachedSelector)([geometries_1.getHeatmapGeometries, get_active_pointer_position_1.getActivePointerPosition, compute_chart_dimensions_1.computeChartElementSizesSelector], function (geoms, pointerPosition) {
    return geoms.pickGridCell(pointerPosition.x, pointerPosition.y);
});
//# sourceMappingURL=picked_shapes.js.map