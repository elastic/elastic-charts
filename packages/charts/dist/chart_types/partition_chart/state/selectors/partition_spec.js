"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartitionSpec = exports.getPartitionSpecs = void 0;
const __1 = require("../../..");
const specs_1 = require("../../../../specs");
const utils_1 = require("../../../../state/utils");
function getPartitionSpecs(state) {
    return (0, utils_1.getSpecsFromStore)(state.specs, __1.ChartType.Partition, specs_1.SpecType.Series);
}
exports.getPartitionSpecs = getPartitionSpecs;
function getPartitionSpec(state) {
    return (0, utils_1.getSpecFromStore)(state.specs, __1.ChartType.Partition, specs_1.SpecType.Series, false);
}
exports.getPartitionSpec = getPartitionSpec;
//# sourceMappingURL=partition_spec.js.map