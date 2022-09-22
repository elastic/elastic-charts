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
exports.computeRatioByGroups = void 0;
var group_data_series_1 = require("../../chart_types/xy_chart/utils/group_data_series");
var common_1 = require("../common");
function computeRatioByGroups(data, groupAccessors, valueGetterSetters) {
    return (0, group_data_series_1.groupBy)(data, groupAccessors, true).flatMap(function (groupedData) {
        var groupSum = groupedData.reduce(function (sum, datum) {
            return (valueGetterSetters.reduce(function (valueSum, _a) {
                var _b = __read(_a, 1), getter = _b[0];
                var value = getter(datum);
                return valueSum + ((0, common_1.isFiniteNumber)(value) ? Math.abs(value) : 0);
            }, 0) + sum);
        }, 0);
        return groupedData.map(function (datum) {
            return valueGetterSetters.reduce(function (acc, _a) {
                var _b = __read(_a, 2), getter = _b[0], setter = _b[1];
                var value = getter(acc);
                return (0, common_1.isFiniteNumber)(value) ? setter(acc, groupSum === 0 ? 0 : Math.abs(value) / groupSum) : acc;
            }, datum);
        });
    });
}
exports.computeRatioByGroups = computeRatioByGroups;
//# sourceMappingURL=data_processing.js.map