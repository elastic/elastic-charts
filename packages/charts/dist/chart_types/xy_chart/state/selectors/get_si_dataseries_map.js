"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiDataSeriesMapSelector = void 0;
const compute_series_domains_1 = require("./compute_series_domains");
const create_selector_1 = require("../../../../state/create_selector");
const series_1 = require("../../utils/series");
exports.getSiDataSeriesMapSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector], ({ formattedDataSeries }) => {
    return formattedDataSeries.reduce((acc, dataSeries) => {
        const seriesKey = (0, series_1.getSeriesKey)(dataSeries, dataSeries.groupId);
        acc[seriesKey] = dataSeries;
        return acc;
    }, {});
});
//# sourceMappingURL=get_si_dataseries_map.js.map