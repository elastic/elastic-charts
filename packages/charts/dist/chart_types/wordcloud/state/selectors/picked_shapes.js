"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickedShapesLayerValues = exports.getPickedShapes = void 0;
const geometries_1 = require("./geometries");
const create_selector_1 = require("../../../../state/create_selector");
function getCurrentPointerPosition(state) {
    return state.interactions.pointer.current.position;
}
exports.getPickedShapes = (0, create_selector_1.createCustomCachedSelector)([geometries_1.geometries, getCurrentPointerPosition], (geoms, pointerPosition) => {
    const picker = geoms.pickQuads;
    const { chartCenter } = geoms;
    const x = pointerPosition.x - chartCenter.x;
    const y = pointerPosition.y - chartCenter.y;
    return picker(x, y);
});
exports.getPickedShapesLayerValues = (0, create_selector_1.createCustomCachedSelector)([exports.getPickedShapes], (pickedShapes) => {
    const elements = pickedShapes.map((model) => {
        const values = [];
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