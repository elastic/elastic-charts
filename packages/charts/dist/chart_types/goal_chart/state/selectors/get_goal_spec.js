"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoalSpecSelector = void 0;
const __1 = require("../../..");
const constants_1 = require("../../../../specs/constants");
const utils_1 = require("../../../../state/utils");
function getGoalSpecSelector(state) {
    return (0, utils_1.getSpecFromStore)(state.specs, __1.ChartType.Goal, constants_1.SpecType.Series, true);
}
exports.getGoalSpecSelector = getGoalSpecSelector;
//# sourceMappingURL=get_goal_spec.js.map