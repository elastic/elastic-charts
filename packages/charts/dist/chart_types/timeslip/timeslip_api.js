"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeslip = void 0;
const __1 = require("..");
const constants_1 = require("../../specs/constants");
const spec_factory_1 = require("../../state/spec_factory");
const common_1 = require("../../utils/common");
const buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.Timeslip,
    specType: constants_1.SpecType.Series,
}, {});
const Timeslip = (props) => {
    const { defaults, overrides } = buildProps;
    (0, spec_factory_1.useSpecFactory)({ ...defaults, ...(0, common_1.stripUndefined)(props), ...overrides });
    return null;
};
exports.Timeslip = Timeslip;
//# sourceMappingURL=timeslip_api.js.map