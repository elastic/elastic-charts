"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const __1 = require("../..");
const constants_1 = require("../../../common/constants");
const constants_2 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
const common_1 = require("../../../utils/common");
const logger_1 = require("../../../utils/logger");
const viewmodel_types_1 = require("../layout/types/viewmodel_types");
const buildProps = (0, spec_factory_1.buildSFProps)()({
    specType: constants_2.SpecType.Series,
    chartType: __1.ChartType.Goal,
}, {
    ...viewmodel_types_1.defaultGoalSpec,
});
const Goal = function (props) {
    var _a, _b;
    const { defaults, overrides } = buildProps;
    const angleStart = (_a = props.angleStart) !== null && _a !== void 0 ? _a : defaults.angleStart;
    const angleEnd = (_b = props.angleEnd) !== null && _b !== void 0 ? _b : defaults.angleEnd;
    const constraints = {};
    if (Math.abs(angleEnd - angleStart) > constants_1.TAU) {
        constraints.angleEnd = angleStart + constants_1.TAU * Math.sign(angleEnd - angleStart);
        logger_1.Logger.warn(`The total angle of the goal chart must not exceed 2π radians.\
To prevent overlapping, the value of \`angleEnd\` will be replaced.

  original: ${angleEnd} (~${(0, common_1.round)(angleEnd / Math.PI, 3)}π)
  replaced: ${constraints.angleEnd} (~${(0, common_1.round)(constraints.angleEnd / Math.PI, 3)}π)
`);
    }
    (0, spec_factory_1.useSpecFactory)({
        ...defaults,
        ...(0, common_1.stripUndefined)(props),
        ...overrides,
        ...constraints,
    });
    return null;
};
exports.Goal = Goal;
//# sourceMappingURL=index.js.map