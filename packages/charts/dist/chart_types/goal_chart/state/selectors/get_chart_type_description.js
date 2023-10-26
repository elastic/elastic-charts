"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartTypeDescriptionSelector = void 0;
const get_goal_spec_1 = require("./get_goal_spec");
const create_selector_1 = require("../../../../state/create_selector");
exports.getChartTypeDescriptionSelector = (0, create_selector_1.createCustomCachedSelector)([get_goal_spec_1.getGoalSpecSelector], (spec) => {
    var _a;
    return `${(_a = spec === null || spec === void 0 ? void 0 : spec.subtype) !== null && _a !== void 0 ? _a : 'goal'} chart`;
});
//# sourceMappingURL=get_chart_type_description.js.map