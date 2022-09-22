"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSingleSeriesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var compute_series_domains_1 = require("./compute_series_domains");
exports.hasSingleSeriesSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector], function (seriesDomainsAndData) {
    return Boolean(seriesDomainsAndData) && seriesDomainsAndData.formattedDataSeries.length > 1;
});
//# sourceMappingURL=has_single_series.js.map