"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeometriesIndexKeysSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var common_1 = require("../../../../utils/common");
var compute_series_geometries_1 = require("./compute_series_geometries");
exports.getGeometriesIndexKeysSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_geometries_1.computeSeriesGeometriesSelector], function (seriesGeometries) { return seriesGeometries.geometriesIndex.keys().sort(common_1.compareByValueAsc); });
//# sourceMappingURL=get_geometries_index_keys.js.map