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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatmapTableSelector = void 0;
var d3_array_1 = require("d3-array");
var predicate_1 = require("../../../../common/predicate");
var constants_1 = require("../../../../scales/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var accessor_1 = require("../../../../utils/accessor");
var elasticsearch_1 = require("../../../../utils/chrono/elasticsearch");
var common_1 = require("../../../../utils/common");
var get_heatmap_spec_1 = require("./get_heatmap_spec");
exports.getHeatmapTableSelector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, get_settings_spec_1.getSettingsSpecSelector], function (_a, _b) {
    var _c, _d;
    var data = _a.data, valueAccessor = _a.valueAccessor, xAccessor = _a.xAccessor, yAccessor = _a.yAccessor, xSortPredicate = _a.xSortPredicate, ySortPredicate = _a.ySortPredicate, xScale = _a.xScale, timeZone = _a.timeZone;
    var xDomain = _b.xDomain;
    var resultData = data.reduce(function (acc, curr, index) {
        var x = (0, accessor_1.getAccessorValue)(curr, xAccessor);
        var y = (0, accessor_1.getAccessorValue)(curr, yAccessor);
        var value = (0, accessor_1.getAccessorValue)(curr, valueAccessor);
        if (!(0, common_1.isNonNullablePrimitiveValue)(x) || !(0, common_1.isNonNullablePrimitiveValue)(y)) {
            return acc;
        }
        if ((0, common_1.isFiniteNumber)(value)) {
            acc.extent = [Math.min(acc.extent[0], value), Math.max(acc.extent[1], value)];
            acc.table.push({
                x: x,
                y: y,
                value: value,
                originalIndex: index,
            });
        }
        if (!acc.xValues.includes(x)) {
            acc.xValues.push(x);
        }
        if (!acc.yValues.includes(y)) {
            acc.yValues.push(y);
        }
        return acc;
    }, {
        table: [],
        xValues: [],
        yValues: [],
        extent: [+Infinity, -Infinity],
        xNumericExtent: [+Infinity, -Infinity],
    });
    if (xScale.type === constants_1.ScaleType.Time) {
        var _e = __read((0, d3_array_1.extent)(resultData.xValues), 2), _f = _e[0], xDataMin = _f === void 0 ? NaN : _f, _g = _e[1], xDataMax = _g === void 0 ? NaN : _g;
        var dataMaxExtended = xDataMax ? (0, elasticsearch_1.addIntervalToTime)(xDataMax, xScale.interval, timeZone) : NaN;
        var _h = __read(!Array.isArray(xDomain) ? [(_c = xDomain === null || xDomain === void 0 ? void 0 : xDomain.min) !== null && _c !== void 0 ? _c : NaN, (_d = xDomain === null || xDomain === void 0 ? void 0 : xDomain.max) !== null && _d !== void 0 ? _d : NaN] : [NaN, NaN], 2), customMin = _h[0], customMax = _h[1];
        var _j = __read((0, d3_array_1.extent)([xDataMin, customMin, customMax, dataMaxExtended]), 2), min = _j[0], max = _j[1];
        resultData.xNumericExtent = [min !== null && min !== void 0 ? min : NaN, max !== null && max !== void 0 ? max : NaN];
        resultData.xValues =
            (0, common_1.isFiniteNumber)(min) && (0, common_1.isFiniteNumber)(max) ? (0, elasticsearch_1.timeRange)(min, max, xScale.interval, timeZone) : [];
    }
    else if (xScale.type === constants_1.ScaleType.Ordinal) {
        resultData.xValues.sort((0, predicate_1.getPredicateFn)(xSortPredicate));
    }
    resultData.yValues.sort((0, predicate_1.getPredicateFn)(ySortPredicate));
    return resultData;
});
//# sourceMappingURL=get_heatmap_table.js.map