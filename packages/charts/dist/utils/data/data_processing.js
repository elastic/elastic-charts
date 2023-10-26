"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeRatioByGroups = void 0;
const group_data_series_1 = require("../../chart_types/xy_chart/utils/group_data_series");
const common_1 = require("../common");
function computeRatioByGroups(data, groupAccessors, valueGetterSetters) {
    return (0, group_data_series_1.groupBy)(data, groupAccessors, true).flatMap((groupedData) => {
        const groupSum = groupedData.reduce((sum, datum) => {
            return (valueGetterSetters.reduce((valueSum, [getter]) => {
                const value = getter(datum);
                return valueSum + ((0, common_1.isFiniteNumber)(value) ? Math.abs(value) : 0);
            }, 0) + sum);
        }, 0);
        return groupedData.map((datum) => {
            return valueGetterSetters.reduce((acc, [getter, setter]) => {
                const value = getter(acc);
                return (0, common_1.isFiniteNumber)(value) ? setter(acc, groupSum === 0 ? 0 : Math.abs(value) / groupSum) : acc;
            }, datum);
        });
    });
}
exports.computeRatioByGroups = computeRatioByGroups;
//# sourceMappingURL=data_processing.js.map