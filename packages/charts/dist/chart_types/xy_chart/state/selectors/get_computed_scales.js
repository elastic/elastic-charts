"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedScalesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var compute_series_geometries_1 = require("./compute_series_geometries");
exports.getComputedScalesSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_geometries_1.computeSeriesGeometriesSelector], function (_a) {
    var scales = _a.scales;
    return scales;
});
//# sourceMappingURL=get_computed_scales.js.map