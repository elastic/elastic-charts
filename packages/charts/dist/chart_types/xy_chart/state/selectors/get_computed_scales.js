"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedScalesSelector = void 0;
const compute_series_geometries_1 = require("./compute_series_geometries");
const create_selector_1 = require("../../../../state/create_selector");
exports.getComputedScalesSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_geometries_1.computeSeriesGeometriesSelector], ({ scales }) => scales);
//# sourceMappingURL=get_computed_scales.js.map