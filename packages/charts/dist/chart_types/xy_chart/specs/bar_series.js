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
exports.BarSeries = void 0;
var __1 = require("../..");
var constants_1 = require("../../../scales/constants");
var constants_2 = require("../../../specs/constants");
var spec_factory_1 = require("../../../state/spec_factory");
var common_1 = require("../../../utils/common");
var specs_1 = require("../utils/specs");
var buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.XYAxis,
    specType: constants_2.SpecType.Series,
    seriesType: specs_1.SeriesType.Bar,
}, {
    groupId: specs_1.DEFAULT_GLOBAL_ID,
    xScaleType: constants_1.ScaleType.Ordinal,
    yScaleType: constants_1.ScaleType.Linear,
    hideInLegend: false,
    enableHistogramMode: false,
});
var BarSeries = function (props) {
    var defaults = buildProps.defaults, overrides = buildProps.overrides;
    (0, spec_factory_1.useSpecFactory)(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides));
    return null;
};
exports.BarSeries = BarSeries;
//# sourceMappingURL=bar_series.js.map