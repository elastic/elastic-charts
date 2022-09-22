"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipInfoSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var tooltip_info_1 = require("../../layout/viewmodel/tooltip_info");
var partition_spec_1 = require("./partition_spec");
var picked_shapes_1 = require("./picked_shapes");
exports.getTooltipInfoSelector = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpec, picked_shapes_1.getPickedShapes], function (spec, pickedShapes) {
    return spec
        ? (0, tooltip_info_1.getTooltipInfo)(pickedShapes, spec.layers.map(function (l) { return l.nodeLabel; }), spec.valueGetter, spec.valueFormatter, spec.percentFormatter, spec.id)
        : tooltip_info_1.EMPTY_TOOLTIP;
});
//# sourceMappingURL=tooltip.js.map