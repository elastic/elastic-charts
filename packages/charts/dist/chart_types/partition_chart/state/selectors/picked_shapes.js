"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickedShapesLayerValues = exports.getPickedShapes = void 0;
const get_active_pointer_position_1 = require("./../../../../state/selectors/get_active_pointer_position");
const geometries_1 = require("./geometries");
const create_selector_1 = require("../../../../state/create_selector");
const picked_shapes_1 = require("../../layout/viewmodel/picked_shapes");
exports.getPickedShapes = (0, create_selector_1.createCustomCachedSelector)([geometries_1.partitionMultiGeometries, get_active_pointer_position_1.getActivePointerPosition, geometries_1.partitionDrilldownFocus], picked_shapes_1.pickedShapes);
exports.getPickedShapesLayerValues = (0, create_selector_1.createCustomCachedSelector)([exports.getPickedShapes], picked_shapes_1.pickShapesLayerValues);
//# sourceMappingURL=picked_shapes.js.map