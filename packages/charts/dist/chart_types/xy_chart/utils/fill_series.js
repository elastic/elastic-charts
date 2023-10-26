"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillSeries = void 0;
const specs_1 = require("./specs");
const constants_1 = require("../../../scales/constants");
function fillSeries(dataSeries, xValues, groupScaleType) {
    const sortedXValues = [...xValues.values()];
    return dataSeries.map((series) => {
        const { spec, data, isStacked } = series;
        const noFillRequired = isXFillNotRequired(spec, groupScaleType, isStacked);
        if (data.length === xValues.size || noFillRequired) {
            return {
                ...series,
                data,
            };
        }
        const filledData = [];
        const missingValues = new Set(xValues);
        data.forEach((datum) => {
            filledData.push(datum);
            missingValues.delete(datum.x);
        });
        const missingValuesArray = [...missingValues.values()];
        missingValuesArray.forEach((missingValue) => {
            const index = sortedXValues.indexOf(missingValue);
            filledData.splice(index, 0, {
                x: missingValue,
                y1: null,
                y0: null,
                initialY1: null,
                initialY0: null,
                mark: null,
                datum: undefined,
                filled: {
                    x: missingValue,
                },
            });
        });
        return {
            ...series,
            data: filledData,
        };
    });
}
exports.fillSeries = fillSeries;
function isXFillNotRequired(spec, groupScaleType, isStacked) {
    const onlyNoFitAreaLine = ((0, specs_1.isAreaSeriesSpec)(spec) || (0, specs_1.isLineSeriesSpec)(spec)) && !spec.fit;
    const onlyContinuous = groupScaleType === constants_1.ScaleType.Linear ||
        groupScaleType === constants_1.ScaleType.LinearBinary ||
        groupScaleType === constants_1.ScaleType.Time;
    return onlyNoFitAreaLine && onlyContinuous && !isStacked;
}
//# sourceMappingURL=fill_series.js.map