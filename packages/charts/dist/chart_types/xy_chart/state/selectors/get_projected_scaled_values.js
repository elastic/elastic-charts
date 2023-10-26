"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectedScaledValues = void 0;
const compute_series_geometries_1 = require("./compute_series_geometries");
const get_geometries_index_keys_1 = require("./get_geometries_index_keys");
const get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
const create_selector_1 = require("../../../../state/create_selector");
const common_1 = require("../../../../utils/common");
exports.getProjectedScaledValues = (0, create_selector_1.createCustomCachedSelector)([get_oriented_projected_pointer_position_1.getOrientedProjectedPointerPositionSelector, compute_series_geometries_1.computeSeriesGeometriesSelector, get_geometries_index_keys_1.getGeometriesIndexKeysSelector], ({ x, y, verticalPanelValue, horizontalPanelValue }, { scales: { xScale, yScales } }, geometriesIndexKeys) => {
    if (!xScale || x === -1) {
        return;
    }
    const xValue = xScale.invertWithStep(x, geometriesIndexKeys).value;
    if ((0, common_1.isNil)(xValue) || Number.isNaN(xValue)) {
        return;
    }
    return {
        x: xValue,
        y: [...yScales.entries()].map(([groupId, yScale]) => ({ value: yScale.invert(y), groupId })),
        smVerticalValue: verticalPanelValue,
        smHorizontalValue: horizontalPanelValue,
    };
});
//# sourceMappingURL=get_projected_scaled_values.js.map