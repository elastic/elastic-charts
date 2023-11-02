"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipInfoSelector = void 0;
const geometries_1 = require("./geometries");
const partition_spec_1 = require("./partition_spec");
const picked_shapes_1 = require("./picked_shapes");
const create_selector_1 = require("../../../../state/create_selector");
const picked_shapes_2 = require("../../layout/viewmodel/picked_shapes");
const EMPTY_TOOLTIP = Object.freeze({ header: null, values: [] });
exports.getTooltipInfoSelector = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpec, picked_shapes_1.getPickedShapes, geometries_1.partitionMultiGeometries], (spec, pickedShapes, shapeViewModel) => {
    return spec
        ? (0, picked_shapes_2.pickShapesTooltipValues)(pickedShapes, shapeViewModel, spec.valueFormatter, spec.percentFormatter, spec.id)
        : EMPTY_TOOLTIP;
});
//# sourceMappingURL=tooltip.js.map