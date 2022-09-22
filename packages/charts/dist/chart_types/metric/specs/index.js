"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMetricWTrend = exports.isMetricWProgress = exports.Metric = exports.MetricTrendShape = void 0;
var __1 = require("../..");
var constants_1 = require("../../../specs/constants");
var spec_factory_1 = require("../../../state/spec_factory");
exports.MetricTrendShape = Object.freeze({
    Bars: 'bars',
    Area: 'area',
});
exports.Metric = (0, spec_factory_1.specComponentFactory)()({
    chartType: __1.ChartType.Metric,
    specType: constants_1.SpecType.Series,
}, {
    data: [],
});
function isMetricWProgress(datum) {
    return datum.hasOwnProperty('domainMax') && !datum.hasOwnProperty('trend');
}
exports.isMetricWProgress = isMetricWProgress;
function isMetricWTrend(datum) {
    return datum.hasOwnProperty('trend') && !datum.hasOwnProperty('domainMax');
}
exports.isMetricWTrend = isMetricWTrend;
//# sourceMappingURL=index.js.map