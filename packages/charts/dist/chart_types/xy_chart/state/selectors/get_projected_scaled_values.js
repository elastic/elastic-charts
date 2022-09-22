"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectedScaledValues = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var common_1 = require("../../../../utils/common");
var compute_series_geometries_1 = require("./compute_series_geometries");
var get_geometries_index_keys_1 = require("./get_geometries_index_keys");
var get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
exports.getProjectedScaledValues = (0, create_selector_1.createCustomCachedSelector)([get_oriented_projected_pointer_position_1.getOrientedProjectedPointerPositionSelector, compute_series_geometries_1.computeSeriesGeometriesSelector, get_geometries_index_keys_1.getGeometriesIndexKeysSelector], function (_a, _b, geometriesIndexKeys) {
    var x = _a.x, y = _a.y, verticalPanelValue = _a.verticalPanelValue, horizontalPanelValue = _a.horizontalPanelValue;
    var _c = _b.scales, xScale = _c.xScale, yScales = _c.yScales;
    if (!xScale || x === -1) {
        return;
    }
    var xValue = xScale.invertWithStep(x, geometriesIndexKeys).value;
    if ((0, common_1.isNil)(xValue) || Number.isNaN(xValue)) {
        return;
    }
    return {
        x: xValue,
        y: __spreadArray([], __read(yScales.entries()), false).map(function (_a) {
            var _b = __read(_a, 2), groupId = _b[0], yScale = _b[1];
            return ({ value: yScale.invert(y), groupId: groupId });
        }),
        smVerticalValue: verticalPanelValue,
        smHorizontalValue: horizontalPanelValue,
    };
});
//# sourceMappingURL=get_projected_scaled_values.js.map