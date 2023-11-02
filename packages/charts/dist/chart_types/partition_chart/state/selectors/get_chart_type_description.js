"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartTypeDescriptionSelector = void 0;
const partition_spec_1 = require("./partition_spec");
const create_selector_1 = require("../../../../state/create_selector");
exports.getChartTypeDescriptionSelector = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpec], (partitionSpec) => {
    var _a;
    return (_a = `${partitionSpec === null || partitionSpec === void 0 ? void 0 : partitionSpec.layout} chart`) !== null && _a !== void 0 ? _a : 'Partition chart';
});
//# sourceMappingURL=get_chart_type_description.js.map