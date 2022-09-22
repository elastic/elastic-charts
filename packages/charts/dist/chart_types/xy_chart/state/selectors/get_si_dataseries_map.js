"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiDataSeriesMapSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var series_1 = require("../../utils/series");
var compute_series_domains_1 = require("./compute_series_domains");
exports.getSiDataSeriesMapSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector], function (_a) {
    var formattedDataSeries = _a.formattedDataSeries;
    return formattedDataSeries.reduce(function (acc, dataSeries) {
        var seriesKey = (0, series_1.getSeriesKey)(dataSeries, dataSeries.groupId);
        acc[seriesKey] = dataSeries;
        return acc;
    }, {});
});
//# sourceMappingURL=get_si_dataseries_map.js.map