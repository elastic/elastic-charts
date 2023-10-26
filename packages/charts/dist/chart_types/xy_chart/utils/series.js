"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeriesIdentifierFromDataSeries = exports.getSeriesColors = exports.getSeriesName = exports.isBandedSpec = exports.getDataSeriesFromSpecs = exports.getFormattedDataSeries = exports.extractYAndMarkFromDatum = exports.getSeriesKey = exports.splitSeriesDataByAccessors = exports.getAccessorFieldName = exports.getSeriesIndex = exports.SERIES_DELIMITER = void 0;
const fit_function_utils_1 = require("./fit_function_utils");
const group_data_series_1 = require("./group_data_series");
const stacked_series_utils_1 = require("./stacked_series_utils");
const colors_1 = require("../../../common/colors");
const constants_1 = require("../../../scales/constants");
const specs_1 = require("../../../specs");
const accessor_1 = require("../../../utils/accessor");
const common_1 = require("../../../utils/common");
const logger_1 = require("../../../utils/logger");
const y_domain_1 = require("../domains/y_domain");
const scale_defaults_1 = require("../scales/scale_defaults");
exports.SERIES_DELIMITER = ' - ';
function getSeriesIndex(series, target) {
    if (!series) {
        return -1;
    }
    return series.findIndex(({ key }) => target.key === key);
}
exports.getSeriesIndex = getSeriesIndex;
function getAccessorFieldName(accessor, index) {
    var _a;
    return typeof accessor === 'function' ? (_a = accessor.fieldName) !== null && _a !== void 0 ? _a : `(index:${index})` : accessor;
}
exports.getAccessorFieldName = getAccessorFieldName;
function splitSeriesDataByAccessors(spec, xValueSums, isStacked = false, stackMode, groupBySpec) {
    var _a, _b, _c, _d, _e;
    const { seriesType, id: specId, groupId, data, xAccessor, yAccessors, y0Accessors, markSizeAccessor, splitSeriesAccessors = [], } = spec;
    const dataSeries = new Map();
    const xValues = [];
    const nonNumericValues = [];
    if (isStacked && Boolean(y0Accessors === null || y0Accessors === void 0 ? void 0 : y0Accessors.length)) {
        logger_1.Logger.warn(`y0Accessors are not allowed with stackAccessors. y0Accessors will be ignored but available under initialY0.`);
    }
    for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        const splitAccessors = getSplitAccessors(datum, splitSeriesAccessors);
        if (splitSeriesAccessors.length > 0 && splitAccessors.size < 1) {
            continue;
        }
        if (typeof datum !== 'object' || datum === null) {
            continue;
        }
        const x = (0, accessor_1.getAccessorValue)(datum, xAccessor);
        if (typeof x !== 'string' && typeof x !== 'number') {
            continue;
        }
        xValues.push(x);
        let sum = (_a = xValueSums.get(x)) !== null && _a !== void 0 ? _a : 0;
        const smH = (_c = (_b = groupBySpec === null || groupBySpec === void 0 ? void 0 : groupBySpec.horizontal) === null || _b === void 0 ? void 0 : _b.by) === null || _c === void 0 ? void 0 : _c.call(_b, spec, datum);
        const smV = (_e = (_d = groupBySpec === null || groupBySpec === void 0 ? void 0 : groupBySpec.vertical) === null || _d === void 0 ? void 0 : _d.by) === null || _e === void 0 ? void 0 : _e.call(_d, spec, datum);
        const xAccessorStr = getAccessorFieldName(xAccessor, 0);
        yAccessors.forEach((accessor, index) => {
            var _a;
            const cleanedDatum = extractYAndMarkFromDatum(datum, accessor, nonNumericValues, isBandedSpec(spec), y0Accessors && y0Accessors[index], markSizeAccessor);
            const yAccessorStr = getAccessorFieldName(accessor, index);
            const splitAccessorStrs = [...splitAccessors.values()].map((a, si) => getAccessorFieldName(a, si));
            const seriesKeys = [...splitAccessorStrs, yAccessorStr];
            const seriesIdentifier = (0, common_1.stripUndefined)({
                specId,
                seriesKeys,
                xAccessor: xAccessorStr,
                yAccessor: yAccessorStr,
                splitAccessors,
                smVerticalAccessorValue: smV,
                smHorizontalAccessorValue: smH,
            });
            const seriesKey = getSeriesKey(seriesIdentifier, groupId);
            sum += (_a = cleanedDatum.y1) !== null && _a !== void 0 ? _a : 0;
            const newDatum = { x, ...cleanedDatum, smH, smV };
            const series = dataSeries.get(seriesKey);
            if (series) {
                series.data.push(newDatum);
            }
            else {
                dataSeries.set(seriesKey, {
                    ...seriesIdentifier,
                    groupId,
                    seriesType,
                    stackMode,
                    isStacked,
                    seriesKeys,
                    key: seriesKey,
                    data: [newDatum],
                    spec,
                    insertIndex: 0,
                    isFiltered: false,
                });
            }
            xValueSums.set(x, sum);
        });
    }
    if (nonNumericValues.length > 0) {
        logger_1.Logger.warn(`Found non-numeric y value${nonNumericValues.length > 1 ? 's' : ''} in dataset for spec "${specId}"`, `(${nonNumericValues.map((v) => JSON.stringify(v)).join(', ')})`);
    }
    return {
        dataSeries,
        xValues,
    };
}
exports.splitSeriesDataByAccessors = splitSeriesDataByAccessors;
function getSeriesKey({ specId, yAccessor, splitAccessors, smVerticalAccessorValue, smHorizontalAccessorValue, }, groupId) {
    const joinedAccessors = [...splitAccessors.entries()]
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([key, value]) => `${key}-${value}`)
        .join('|');
    const smV = smVerticalAccessorValue ? `smV{${smVerticalAccessorValue}}` : '';
    const smH = smHorizontalAccessorValue ? `smH{${smHorizontalAccessorValue}}` : '';
    return `groupId{${groupId}}spec{${specId}}yAccessor{${yAccessor}}splitAccessors{${joinedAccessors}}${smV}${smH}`;
}
exports.getSeriesKey = getSeriesKey;
function getSplitAccessors(datum, accessors = []) {
    const splitAccessors = new Map();
    if (typeof datum === 'object' && datum !== null) {
        accessors.forEach((accessor, index) => {
            const value = (0, accessor_1.getAccessorValue)(datum, accessor);
            if (typeof value === 'string' || typeof value === 'number') {
                const accessorStr = getAccessorFieldName(accessor, index);
                splitAccessors.set(accessorStr, value);
            }
        });
    }
    return splitAccessors;
}
function extractYAndMarkFromDatum(datum, yAccessor, nonNumericValues, bandedSpec, y0Accessor, markSizeAccessor) {
    const mark = markSizeAccessor === undefined ? null : finiteOrNull((0, accessor_1.getAccessorValue)(datum, markSizeAccessor), nonNumericValues);
    const y1Value = (0, accessor_1.getAccessorValue)(datum, yAccessor);
    const y1 = finiteOrNull(y1Value, nonNumericValues);
    const y0 = y0Accessor ? finiteOrNull((0, accessor_1.getAccessorValue)(datum, y0Accessor), nonNumericValues) : null;
    return { y1, datum, y0: bandedSpec ? y0 : null, mark, initialY0: y0, initialY1: y1 };
}
exports.extractYAndMarkFromDatum = extractYAndMarkFromDatum;
function finiteOrNull(value, nonNumericValues) {
    const candidateNumber = Number(value !== null && value !== void 0 ? value : undefined);
    const finite = Number.isFinite(candidateNumber);
    if (!finite)
        nonNumericValues.push(value);
    return finite ? candidateNumber : null;
}
const getSortedDataSeries = (dataSeries, xValues, xScaleType) => dataSeries.map(({ data, ...rest }) => ({
    ...rest,
    data: [...data].sort((0, stacked_series_utils_1.datumXSortPredicate)(xScaleType, [...xValues.values()])),
}));
function getFormattedDataSeries(seriesSpecs, availableDataSeries, xValues, xScaleType) {
    const histogramEnabled = (0, y_domain_1.isHistogramEnabled)(seriesSpecs);
    const fittedDataSeries = (0, fit_function_utils_1.applyFitFunctionToDataSeries)(getSortedDataSeries(availableDataSeries, xValues, xScaleType), seriesSpecs, xScaleType);
    const stackedDataSeries = fittedDataSeries.filter(({ spec }) => (0, y_domain_1.isStackedSpec)(spec, histogramEnabled));
    const stackedGroups = (0, group_data_series_1.groupBy)(stackedDataSeries, ['smHorizontalAccessorValue', 'smVerticalAccessorValue', 'groupId'], true);
    const fittedAndStackedDataSeries = stackedGroups.reduce((acc, dataSeries) => {
        if (!dataSeries[0])
            return acc;
        const [{ stackMode, seriesType }] = dataSeries;
        const formatted = (0, stacked_series_utils_1.formatStackedDataSeriesValues)(dataSeries, xValues, seriesType, stackMode);
        return [...acc, ...formatted];
    }, []);
    const nonStackedDataSeries = fittedDataSeries.filter(({ spec }) => !(0, y_domain_1.isStackedSpec)(spec, histogramEnabled));
    return [...fittedAndStackedDataSeries, ...nonStackedDataSeries];
}
exports.getFormattedDataSeries = getFormattedDataSeries;
function getDataSeriesFromSpecs(seriesSpecs, deselectedDataSeries = [], orderOrdinalBinsBy, groupBySpec) {
    let globalDataSeries = [];
    const mutatedXValueSums = new Map();
    const globalXValues = new Set();
    let isNumberArray = true;
    let isOrdinalScale = false;
    const specsByYGroup = (0, y_domain_1.groupSeriesByYGroup)(seriesSpecs);
    for (const spec of seriesSpecs) {
        if (spec.xScaleType === constants_1.ScaleType.Ordinal) {
            isOrdinalScale = true;
        }
        const specGroup = specsByYGroup.get(spec.groupId);
        const isStacked = Boolean(specGroup === null || specGroup === void 0 ? void 0 : specGroup.stacked.find(({ id }) => id === spec.id));
        const { dataSeries, xValues } = splitSeriesDataByAccessors(spec, mutatedXValueSums, isStacked, specGroup === null || specGroup === void 0 ? void 0 : specGroup.stackMode, groupBySpec);
        let filteredDataSeries = [...dataSeries.values()];
        if (deselectedDataSeries.length > 0) {
            filteredDataSeries = filteredDataSeries.map((series) => ({
                ...series,
                isFiltered: deselectedDataSeries.some(({ key: deselectedKey }) => series.key === deselectedKey),
            }));
        }
        globalDataSeries = [...globalDataSeries, ...filteredDataSeries];
        for (const xValue of xValues) {
            if (isNumberArray && typeof xValue !== 'number') {
                isNumberArray = false;
            }
            globalXValues.add(xValue);
        }
    }
    const xValues = isOrdinalScale || !isNumberArray
        ? getSortedOrdinalXValues(globalXValues, mutatedXValueSums, orderOrdinalBinsBy)
        : new Set([...globalXValues].sort((a, b) => {
            if (typeof a === 'string' || typeof b === 'string') {
                return 0;
            }
            return a - b;
        }));
    const dataSeries = globalDataSeries.map((d, i) => ({
        ...d,
        insertIndex: i,
    }));
    const smallMultipleUniqueValues = dataSeries.reduce((acc, curr) => {
        if (curr.isFiltered) {
            return acc;
        }
        if (!(0, common_1.isNil)(curr.smHorizontalAccessorValue)) {
            acc.smHValues.add(curr.smHorizontalAccessorValue);
        }
        if (!(0, common_1.isNil)(curr.smVerticalAccessorValue)) {
            acc.smVValues.add(curr.smVerticalAccessorValue);
        }
        return acc;
    }, { smVValues: new Set(), smHValues: new Set() });
    return {
        dataSeries,
        xValues,
        ...smallMultipleUniqueValues,
        fallbackScale: !isOrdinalScale && !isNumberArray ? scale_defaults_1.X_SCALE_DEFAULT.type : undefined,
    };
}
exports.getDataSeriesFromSpecs = getDataSeriesFromSpecs;
function isBandedSpec(spec) {
    return Boolean(spec.y0Accessors && spec.y0Accessors.length > 0 && !(0, y_domain_1.isStackedSpec)(spec, false));
}
exports.isBandedSpec = isBandedSpec;
function getSortedOrdinalXValues(xValues, xValueSums, orderOrdinalBinsBy) {
    if (!orderOrdinalBinsBy) {
        return xValues;
    }
    switch (orderOrdinalBinsBy === null || orderOrdinalBinsBy === void 0 ? void 0 : orderOrdinalBinsBy.binAgg) {
        case specs_1.BinAgg.None:
            return xValues;
        case specs_1.BinAgg.Sum:
        default:
            return new Set([...xValues].sort((v1, v2) => {
                var _a, _b;
                return (orderOrdinalBinsBy.direction === specs_1.Direction.Ascending ? 1 : -1) *
                    (((_a = xValueSums.get(v1)) !== null && _a !== void 0 ? _a : 0) - ((_b = xValueSums.get(v2)) !== null && _b !== void 0 ? _b : 0));
            }));
    }
}
const BIG_NUMBER = Number.MAX_SAFE_INTEGER;
function getSeriesNameFromOptions(options, { yAccessor, splitAccessors }, delimiter) {
    if (!options.names) {
        return null;
    }
    return ([...options.names]
        .sort(({ sortIndex: a = BIG_NUMBER }, { sortIndex: b = BIG_NUMBER }) => a - b)
        .map(({ accessor, value, name }) => {
        var _a;
        const accessorValue = (_a = splitAccessors.get(accessor)) !== null && _a !== void 0 ? _a : null;
        if (accessorValue === value) {
            return name !== null && name !== void 0 ? name : value;
        }
        if (yAccessor === accessor) {
            return name !== null && name !== void 0 ? name : accessor;
        }
        return null;
    })
        .filter((d) => Boolean(d) || d === 0)
        .join(delimiter) || null);
}
function getSeriesName(seriesIdentifier, hasSingleSeries, isTooltip, spec) {
    var _a, _b;
    const customLabel = typeof (spec === null || spec === void 0 ? void 0 : spec.name) === 'function'
        ? spec.name(seriesIdentifier, isTooltip)
        : typeof (spec === null || spec === void 0 ? void 0 : spec.name) === 'object'
            ? getSeriesNameFromOptions(spec.name, seriesIdentifier, (_a = spec.name.delimiter) !== null && _a !== void 0 ? _a : exports.SERIES_DELIMITER)
            : null;
    if (customLabel !== null) {
        return customLabel.toString();
    }
    const multipleYAccessors = spec && spec.yAccessors.length > 1;
    const nameKeys = multipleYAccessors ? seriesIdentifier.seriesKeys : seriesIdentifier.seriesKeys.slice(0, -1);
    const nonZeroLength = nameKeys.length > 0;
    return nonZeroLength && ((spec === null || spec === void 0 ? void 0 : spec.splitSeriesAccessors) || !hasSingleSeries)
        ? nameKeys.join(typeof (spec === null || spec === void 0 ? void 0 : spec.name) === 'object' ? (_b = spec.name.delimiter) !== null && _b !== void 0 ? _b : exports.SERIES_DELIMITER : exports.SERIES_DELIMITER)
        : spec === undefined
            ? ''
            : typeof spec.name === 'string'
                ? spec.name
                : spec.id;
}
exports.getSeriesName = getSeriesName;
function getHighestOverride(key, customColors, overrides) {
    const tempColor = overrides.temporary[key];
    return tempColor || customColors.get(key) || (tempColor === null ? undefined : overrides.persisted[key]);
}
function getSeriesColors(dataSeries, chartColors, customColors, overrides) {
    const seriesColorMap = new Map();
    let counter = 0;
    const sortedDataSeries = [...dataSeries].sort((a, b) => a.insertIndex - b.insertIndex);
    (0, group_data_series_1.groupBy)(sortedDataSeries, (ds) => {
        return [ds.specId, ds.groupId, ds.yAccessor, ...ds.splitAccessors.values()].join('__');
    }, true).forEach(([ds]) => {
        if (!ds)
            return;
        const seriesKey = getSeriesKey({
            specId: ds.specId,
            yAccessor: ds.yAccessor,
            splitAccessors: ds.splitAccessors,
        }, ds.groupId);
        const colorOverride = getHighestOverride(seriesKey, customColors, overrides);
        const color = colorOverride || chartColors.vizColors[counter % chartColors.vizColors.length] || colors_1.Colors.White.keyword;
        seriesColorMap.set(seriesKey, color);
        counter++;
    });
    return seriesColorMap;
}
exports.getSeriesColors = getSeriesColors;
function getSeriesIdentifierFromDataSeries(dataSeries) {
    const { key, specId, seriesKeys, xAccessor, yAccessor, splitAccessors, smVerticalAccessorValue, smHorizontalAccessorValue, } = dataSeries;
    return (0, common_1.stripUndefined)({
        key,
        specId,
        seriesKeys,
        xAccessor,
        yAccessor,
        splitAccessors,
        smVerticalAccessorValue,
        smHorizontalAccessorValue,
    });
}
exports.getSeriesIdentifierFromDataSeries = getSeriesIdentifierFromDataSeries;
//# sourceMappingURL=series.js.map