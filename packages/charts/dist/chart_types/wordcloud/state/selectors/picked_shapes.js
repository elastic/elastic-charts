"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickedShapesLayerValues = exports.getPickedShapes = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var geometries_1 = require("./geometries");
function getCurrentPointerPosition(state) {
    return state.interactions.pointer.current.position;
}
exports.getPickedShapes = (0, create_selector_1.createCustomCachedSelector)([geometries_1.geometries, getCurrentPointerPosition], function (geoms, pointerPosition) {
    var picker = geoms.pickQuads;
    var chartCenter = geoms.chartCenter;
    var x = pointerPosition.x - chartCenter.x;
    var y = pointerPosition.y - chartCenter.y;
    return picker(x, y);
});
exports.getPickedShapesLayerValues = (0, create_selector_1.createCustomCachedSelector)([exports.getPickedShapes], function (pickedShapes) {
    var elements = pickedShapes.map(function (model) {
        var values = [];
        values.push({
            smAccessorValue: '',
            groupByRollup: 'Word count',
            value: model.data.length,
            sortIndex: 0,
            path: [],
            depth: 0,
        });
        return values.reverse();
    });
    return elements;
});
//# sourceMappingURL=picked_shapes.js.map