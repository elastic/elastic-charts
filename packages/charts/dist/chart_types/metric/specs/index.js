"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMetricWTrend = exports.isMetricWProgress = exports.isMetricWText = exports.isMetricWNumber = exports.Metric = exports.MetricTrendShape = void 0;
const __1 = require("../..");
const constants_1 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
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
function isMetricWNumber(datum) {
    return typeof datum.value === 'number' && datum.hasOwnProperty('valueFormatter');
}
exports.isMetricWNumber = isMetricWNumber;
function isMetricWText(datum) {
    return typeof datum.value === 'string';
}
exports.isMetricWText = isMetricWText;
function isMetricWProgress(datum) {
    return isMetricWNumber(datum) && datum.hasOwnProperty('domainMax') && !datum.hasOwnProperty('trend');
}
exports.isMetricWProgress = isMetricWProgress;
function isMetricWTrend(datum) {
    return ((isMetricWNumber(datum) || isMetricWText(datum)) &&
        datum.hasOwnProperty('trend') &&
        !datum.hasOwnProperty('domainMax'));
}
exports.isMetricWTrend = isMetricWTrend;
//# sourceMappingURL=index.js.map