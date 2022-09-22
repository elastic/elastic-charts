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
exports.Heatmap = void 0;
var __1 = require("../..");
var predicate_1 = require("../../../common/predicate");
var constants_1 = require("../../../specs/constants");
var spec_factory_1 = require("../../../state/spec_factory");
var common_1 = require("../../../utils/common");
var scale_defaults_1 = require("./scale_defaults");
var buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.Heatmap,
    specType: constants_1.SpecType.Series,
}, {
    data: [],
    valueAccessor: function (_a) {
        var value = _a.value;
        return value;
    },
    xScale: { type: scale_defaults_1.X_SCALE_DEFAULT.type },
    valueFormatter: function (value) { return "".concat(value); },
    xSortPredicate: predicate_1.Predicate.AlphaAsc,
    ySortPredicate: predicate_1.Predicate.AlphaAsc,
    xAccessor: function (d) { return d === null || d === void 0 ? void 0 : d.x; },
    yAccessor: function (d) { return d === null || d === void 0 ? void 0 : d.y; },
    timeZone: 'UTC',
    xAxisTitle: '',
    yAxisTitle: '',
    xAxisLabelName: 'X Value',
    xAxisLabelFormatter: String,
    yAxisLabelName: 'Y Value',
    yAxisLabelFormatter: String,
});
var Heatmap = function (props) {
    var defaults = buildProps.defaults, overrides = buildProps.overrides;
    (0, spec_factory_1.useSpecFactory)(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides));
    return null;
};
exports.Heatmap = Heatmap;
//# sourceMappingURL=heatmap.js.map