"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartitionSpec = exports.getPartitionSpecs = void 0;
var __1 = require("../../..");
var specs_1 = require("../../../../specs");
var utils_1 = require("../../../../state/utils");
function getPartitionSpecs(state) {
    return (0, utils_1.getSpecsFromStore)(state.specs, __1.ChartType.Partition, specs_1.SpecType.Series);
}
exports.getPartitionSpecs = getPartitionSpecs;
function getPartitionSpec(state) {
    var partitionSpecs = getPartitionSpecs(state);
    return partitionSpecs.length > 0 ? partitionSpecs[0] : null;
}
exports.getPartitionSpec = getPartitionSpec;
//# sourceMappingURL=partition_spec.js.map