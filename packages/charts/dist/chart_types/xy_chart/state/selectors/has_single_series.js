"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSingleSeriesSelector = void 0;
const compute_series_domains_1 = require("./compute_series_domains");
const create_selector_1 = require("../../../../state/create_selector");
exports.hasSingleSeriesSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_domains_1.computeSeriesDomainsSelector], (seriesDomainsAndData) => Boolean(seriesDomainsAndData) && seriesDomainsAndData.formattedDataSeries.length > 1);
//# sourceMappingURL=has_single_series.js.map