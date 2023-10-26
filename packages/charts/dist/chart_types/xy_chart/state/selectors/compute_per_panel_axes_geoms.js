"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePerPanelAxesGeomsSelector = void 0;
const compute_axes_geometries_1 = require("./compute_axes_geometries");
const panel_utils_1 = require("../../../../common/panel_utils");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_small_multiples_index_order_1 = require("../../../../state/selectors/get_small_multiples_index_order");
const axis_type_utils_1 = require("../../utils/axis_type_utils");
const isPrimaryColumnFn = ({ horizontal: { domain } }) => (position, horizontalValue) => (0, axis_type_utils_1.isVerticalAxis)(position) && domain[0] === horizontalValue;
const isPrimaryRowFn = ({ vertical: { domain } }) => (position, verticalValue) => (0, axis_type_utils_1.isHorizontalAxis)(position) && domain[0] === verticalValue;
exports.computePerPanelAxesGeomsSelector = (0, create_selector_1.createCustomCachedSelector)([compute_axes_geometries_1.computeAxesGeometriesSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector, get_small_multiples_index_order_1.getSmallMultiplesIndexOrderSelector], (axesGeoms, scales, groupBySpec) => {
    const { horizontal, vertical } = scales;
    const isPrimaryColumn = isPrimaryColumnFn(scales);
    const isPrimaryRow = isPrimaryRowFn(scales);
    return (0, panel_utils_1.getPerPanelMap)(scales, (_, h, v) => ({
        axesGeoms: axesGeoms.map((geom) => {
            const { position } = geom.axis;
            const isVertical = (0, axis_type_utils_1.isVerticalAxis)(position);
            const usePanelTitle = isVertical ? (0, panel_utils_1.hasSMDomain)(vertical) : (0, panel_utils_1.hasSMDomain)(horizontal);
            const panelTitle = usePanelTitle ? (0, panel_utils_1.getPanelTitle)(isVertical, v, h, groupBySpec) : undefined;
            const secondary = !isPrimaryColumn(position, h) && !isPrimaryRow(position, v);
            return { ...geom, axis: { ...geom.axis, panelTitle, secondary } };
        }),
    }));
});
//# sourceMappingURL=compute_per_panel_axes_geoms.js.map