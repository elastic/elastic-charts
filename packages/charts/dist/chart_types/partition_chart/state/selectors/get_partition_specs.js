"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartitionSpecs = void 0;
const __1 = require("../../..");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_specs_1 = require("../../../../state/selectors/get_specs");
const utils_1 = require("../../../../state/utils");
exports.getPartitionSpecs = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => {
    return (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Partition, specs_1.SpecType.Series);
});
//# sourceMappingURL=get_partition_specs.js.map