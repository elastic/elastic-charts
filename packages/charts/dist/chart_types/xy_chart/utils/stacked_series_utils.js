"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStackedDataSeriesValues = exports.datumXSortPredicate = void 0;
const d3_shape_1 = require("d3-shape");
const diverging_offsets_1 = require("./diverging_offsets");
const specs_1 = require("./specs");
const constants_1 = require("../../../scales/constants");
const common_1 = require("../../../utils/common");
const logger_1 = require("../../../utils/logger");
const datumXSortPredicate = (xScaleType, sortedXValues) => (a, b) => {
    if (xScaleType === constants_1.ScaleType.Ordinal || typeof a.x === 'string' || typeof b.x === 'string') {
        return sortedXValues ? sortedXValues.indexOf(a.x) - sortedXValues.indexOf(b.x) : 0;
    }
    return a.x - b.x;
};
exports.datumXSortPredicate = datumXSortPredicate;
function formatStackedDataSeriesValues(dataSeries, xValues, seriesType, stackMode) {
    const dataSeriesMap = dataSeries.reduce((acc, curr) => {
        return acc.set(curr.key, curr);
    }, new Map());
    let hasNegative = false;
    let hasPositive = false;
    const xMap = new Map();
    [...xValues].forEach((xValue) => {
        const seriesMap = new Map();
        dataSeries.forEach(({ key, data, isFiltered }) => {
            var _a;
            if (isFiltered)
                return;
            const datum = data.find(({ x }) => x === xValue);
            if (!datum)
                return;
            const y1 = (_a = datum.y1) !== null && _a !== void 0 ? _a : 0;
            if (hasPositive || y1 > 0)
                hasPositive = true;
            if (hasNegative || y1 < 0)
                hasNegative = true;
            seriesMap.set(`${key}-y0`, datum);
            seriesMap.set(key, datum);
        });
        xMap.set(xValue, seriesMap);
    });
    if (hasNegative && hasPositive && seriesType === specs_1.SeriesType.Area) {
        logger_1.Logger.warn(`Area series should be avoided with dataset containing positive and negative values. Use a bar series instead.`);
    }
    const keys = [...dataSeriesMap.keys()].reduce((acc, key) => [...acc, `${key}-y0`, key], []);
    const stackOffset = getOffsetBasedOnStackMode(stackMode, hasNegative && !hasPositive);
    const stack = (0, d3_shape_1.stack)()
        .keys(keys)
        .value(([, indexMap], key) => {
        var _a, _b;
        const datum = indexMap.get(key);
        if (!datum)
            return 0;
        return key.endsWith('-y0') ? (_a = datum.y0) !== null && _a !== void 0 ? _a : 0 : (_b = datum.y1) !== null && _b !== void 0 ? _b : 0;
    })
        .order(d3_shape_1.stackOrderNone)
        .offset(stackOffset)(xMap)
        .filter(({ key }) => !key.endsWith('-y0'));
    return stack
        .map((stackedSeries) => {
        const dataSeriesProps = dataSeriesMap.get(stackedSeries.key);
        if (!dataSeriesProps)
            return null;
        const data = stackedSeries
            .map((row) => {
            const d = row.data[1].get(stackedSeries.key);
            if (!d || d.x === undefined || d.x === null)
                return null;
            const { initialY0, initialY1, mark, datum, filled, x } = d;
            const [y0, y1] = row;
            return {
                x,
                y1: clampIfStackedAsPercentage(y1, stackMode),
                y0: clampIfStackedAsPercentage(y0, stackMode),
                initialY0,
                initialY1,
                mark,
                datum,
                filled,
            };
        })
            .filter(common_1.isDefined);
        return {
            ...dataSeriesProps,
            data,
        };
    })
        .filter(common_1.isDefined);
}
exports.formatStackedDataSeriesValues = formatStackedDataSeriesValues;
function clampIfStackedAsPercentage(value, stackMode) {
    return stackMode === specs_1.StackMode.Percentage ? (0, common_1.clamp)(value, 0, 1) : value;
}
function getOffsetBasedOnStackMode(stackMode, onlyNegative = false) {
    if (onlyNegative && stackMode === specs_1.StackMode.Wiggle)
        return d3_shape_1.stackOffsetWiggle;
    switch (stackMode) {
        case specs_1.StackMode.Percentage:
            return diverging_offsets_1.divergingPercentage;
        case specs_1.StackMode.Silhouette:
            return diverging_offsets_1.divergingSilhouette;
        case specs_1.StackMode.Wiggle:
            return diverging_offsets_1.divergingWiggle;
        default:
            return diverging_offsets_1.diverging;
    }
}
//# sourceMappingURL=stacked_series_utils.js.map