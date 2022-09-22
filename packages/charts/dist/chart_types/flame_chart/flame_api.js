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
exports.Flame = void 0;
var __1 = require("..");
var constants_1 = require("../../specs/constants");
var spec_factory_1 = require("../../state/spec_factory");
var common_1 = require("../../utils/common");
var buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.Flame,
    specType: constants_1.SpecType.Series,
}, {
    valueAccessor: function (d) { return (typeof d === 'number' ? d : 0); },
    valueGetter: function (n) { return n; },
    valueFormatter: function (d) { return String(d); },
    animation: { duration: 0 },
});
var Flame = function (props) {
    var defaults = buildProps.defaults, overrides = buildProps.overrides;
    (0, spec_factory_1.useSpecFactory)(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides));
    return null;
};
exports.Flame = Flame;
//# sourceMappingURL=flame_api.js.map