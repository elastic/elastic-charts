"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartTypeDescriptionSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var goal_spec_1 = require("./goal_spec");
exports.getChartTypeDescriptionSelector = (0, create_selector_1.createCustomCachedSelector)([goal_spec_1.getSpecOrNull], function (spec) {
    var _a;
    return "".concat((_a = spec === null || spec === void 0 ? void 0 : spec.subtype) !== null && _a !== void 0 ? _a : 'goal', " chart");
});
//# sourceMappingURL=get_chart_type_description.js.map