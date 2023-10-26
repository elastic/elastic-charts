"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTooltipSnapEnableSelector = void 0;
const compute_series_geometries_1 = require("./compute_series_geometries");
const create_selector_1 = require("../../../../state/create_selector");
const get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
exports.isTooltipSnapEnableSelector = (0, create_selector_1.createCustomCachedSelector)([compute_series_geometries_1.computeSeriesGeometriesSelector, get_tooltip_spec_1.getTooltipSpecSelector], (seriesGeometries, { snap }) => (seriesGeometries.scales.xScale && seriesGeometries.scales.xScale.bandwidth > 0) || snap);
//# sourceMappingURL=is_tooltip_snap_enabled.js.map