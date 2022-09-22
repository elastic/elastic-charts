"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupBy = void 0;
var chart_types_1 = require("../chart_types");
var spec_factory_1 = require("../state/spec_factory");
var common_1 = require("../utils/common");
var constants_1 = require("./constants");
var buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: chart_types_1.ChartType.Global,
    specType: constants_1.SpecType.IndexOrder,
}, {});
var GroupBy = function (props) {
    var defaults = buildProps.defaults, overrides = buildProps.overrides;
    (0, spec_factory_1.useSpecFactory)(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides));
    return null;
};
exports.GroupBy = GroupBy;
//# sourceMappingURL=group_by.js.map