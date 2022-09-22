"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePerPanelAxesGeomsSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var common_1 = require("../../../../utils/common");
var axis_type_utils_1 = require("../../utils/axis_type_utils");
var panel_1 = require("../../utils/panel");
var panel_utils_1 = require("../../utils/panel_utils");
var compute_axes_geometries_1 = require("./compute_axes_geometries");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var get_specs_1 = require("./get_specs");
var getPanelTitle = function (isVertical, verticalValue, horizontalValue, groupBy) {
    var _a, _b;
    var formatter = isVertical ? (_a = groupBy === null || groupBy === void 0 ? void 0 : groupBy.vertical) === null || _a === void 0 ? void 0 : _a.format : (_b = groupBy === null || groupBy === void 0 ? void 0 : groupBy.horizontal) === null || _b === void 0 ? void 0 : _b.format;
    var value = isVertical ? "".concat(verticalValue) : "".concat(horizontalValue);
    return (0, common_1.safeFormat)(value, formatter);
};
var isPrimaryColumnFn = function (_a) {
    var domain = _a.horizontal.domain;
    return function (position, horizontalValue) {
        return (0, axis_type_utils_1.isVerticalAxis)(position) && domain[0] === horizontalValue;
    };
};
var isPrimaryRowFn = function (_a) {
    var domain = _a.vertical.domain;
    return function (position, verticalValue) {
        return (0, axis_type_utils_1.isHorizontalAxis)(position) && domain[0] === verticalValue;
    };
};
exports.computePerPanelAxesGeomsSelector = (0, create_selector_1.createCustomCachedSelector)([compute_axes_geometries_1.computeAxesGeometriesSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector, get_specs_1.getSmallMultiplesIndexOrderSelector], function (axesGeoms, scales, groupBySpec) {
    var horizontal = scales.horizontal, vertical = scales.vertical;
    var isPrimaryColumn = isPrimaryColumnFn(scales);
    var isPrimaryRow = isPrimaryRowFn(scales);
    return (0, panel_utils_1.getPerPanelMap)(scales, function (_, h, v) { return ({
        axesGeoms: axesGeoms.map(function (geom) {
            var position = geom.axis.position;
            var isVertical = (0, axis_type_utils_1.isVerticalAxis)(position);
            var usePanelTitle = isVertical ? (0, panel_1.hasSMDomain)(vertical) : (0, panel_1.hasSMDomain)(horizontal);
            var panelTitle = usePanelTitle ? getPanelTitle(isVertical, v, h, groupBySpec) : undefined;
            var secondary = !isPrimaryColumn(position, h) && !isPrimaryRow(position, v);
            return __assign(__assign({}, geom), { axis: __assign(__assign({}, geom.axis), { panelTitle: panelTitle, secondary: secondary }) });
        }),
    }); });
});
//# sourceMappingURL=compute_per_panel_axes_geoms.js.map