"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartTypeDescriptionSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var partition_spec_1 = require("./partition_spec");
exports.getChartTypeDescriptionSelector = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpec], function (partitionSpec) {
    var _a;
    return (_a = "".concat(partitionSpec === null || partitionSpec === void 0 ? void 0 : partitionSpec.layout, " chart")) !== null && _a !== void 0 ? _a : 'Partition chart';
});
//# sourceMappingURL=get_chart_type_description.js.map