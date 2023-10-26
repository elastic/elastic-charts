"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickedShapesLayerValues = exports.getPickedShapes = exports.getCaptureBoundingBox = void 0;
const get_active_pointer_position_1 = require("./../../../../state/selectors/get_active_pointer_position");
const geometries_1 = require("./geometries");
const create_selector_1 = require("../../../../state/create_selector");
const geoms_1 = require("../../layout/viewmodel/geoms");
function fullBoundingBox(ctx, geoms) {
    const box = (0, geoms_1.initialBoundingBox)();
    if (ctx) {
        for (const g of geoms) {
            for (const { x0, y0, x1, y1 } of g.boundingBoxes(ctx)) {
                box.x0 = Math.min(box.x0, x0, x1);
                box.y0 = Math.min(box.y0, y0, y1);
                box.x1 = Math.max(box.x1, x0, x1);
                box.y1 = Math.max(box.y1, y0, y1);
            }
        }
    }
    return box;
}
exports.getCaptureBoundingBox = (0, create_selector_1.createCustomCachedSelector)([geometries_1.getPrimitiveGeoms], (geoms) => {
    const textMeasurer = document.createElement('canvas');
    const ctx = textMeasurer.getContext('2d');
    return fullBoundingBox(ctx, geoms);
});
exports.getPickedShapes = (0, create_selector_1.createCustomCachedSelector)([geometries_1.geometries, get_active_pointer_position_1.getActivePointerPosition, exports.getCaptureBoundingBox], (geoms, pointerPosition, capture) => {
    const picker = geoms.pickQuads;
    const { chartCenter } = geoms;
    const { x, y } = pointerPosition;
    return capture.x0 <= x && x <= capture.x1 && capture.y0 <= y && y <= capture.y1
        ? picker(x - chartCenter.x, y - chartCenter.y)
        : [];
});
exports.getPickedShapesLayerValues = (0, create_selector_1.createCustomCachedSelector)([exports.getPickedShapes], (pickedShapes) => {
    return pickedShapes.map((model) => {
        const values = [];
        values.push({
            smAccessorValue: '',
            groupByRollup: 'Actual',
            value: model.actual,
            sortIndex: 0,
            path: [],
            depth: 0,
        });
        return values.reverse();
    });
});
//# sourceMappingURL=picked_shapes.js.map