"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeometriesIndexSelector = void 0;
const compute_series_geometries_1 = require("./compute_series_geometries");
const create_selector_1 = require("../../../../state/create_selector");
exports.getGeometriesIndexSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_geometries_1.computeSeriesGeometriesSelector], ({ geometriesIndex }) => geometriesIndex);
//# sourceMappingURL=get_geometries_index.js.map