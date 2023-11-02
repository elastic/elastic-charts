"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupBy = void 0;
const constants_1 = require("./constants");
const chart_types_1 = require("../chart_types");
const spec_factory_1 = require("../state/spec_factory");
const common_1 = require("../utils/common");
const buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: chart_types_1.ChartType.Global,
    specType: constants_1.SpecType.IndexOrder,
}, {});
const GroupBy = function (props) {
    const { defaults, overrides } = buildProps;
    (0, spec_factory_1.useSpecFactory)({ ...defaults, ...(0, common_1.stripUndefined)(props), ...overrides });
    return null;
};
exports.GroupBy = GroupBy;
//# sourceMappingURL=group_by.js.map