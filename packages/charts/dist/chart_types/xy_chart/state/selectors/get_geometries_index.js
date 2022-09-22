"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeometriesIndexSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var compute_series_geometries_1 = require("./compute_series_geometries");
exports.getGeometriesIndexSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_geometries_1.computeSeriesGeometriesSelector], function (_a) {
    var geometriesIndex = _a.geometriesIndex;
    return geometriesIndex;
});
//# sourceMappingURL=get_geometries_index.js.map