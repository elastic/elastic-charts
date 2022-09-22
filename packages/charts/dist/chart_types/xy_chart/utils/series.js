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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeriesIdentifierFromDataSeries = exports.getSeriesColors = exports.getSeriesName = exports.isBandedSpec = exports.getDataSeriesFromSpecs = exports.getFormattedDataSeries = exports.extractYAndMarkFromDatum = exports.getSeriesKey = exports.splitSeriesDataByAccessors = exports.getAccessorFieldName = exports.getSeriesIndex = exports.SERIES_DELIMITER = void 0;
var constants_1 = require("../../../scales/constants");
var specs_1 = require("../../../specs");
var accessor_1 = require("../../../utils/accessor");
var common_1 = require("../../../utils/common");
var logger_1 = require("../../../utils/logger");
var y_domain_1 = require("../domains/y_domain");
var scale_defaults_1 = require("../scales/scale_defaults");
var fit_function_utils_1 = require("./fit_function_utils");
var group_data_series_1 = require("./group_data_series");
var stacked_series_utils_1 = require("./stacked_series_utils");
exports.SERIES_DELIMITER = ' - ';
function getSeriesIndex(series, target) {
    if (!series) {
        return -1;
    }
    return series.findIndex(function (_a) {
        var key = _a.key;
        return target.key === key;
    });
}
exports.getSeriesIndex = getSeriesIndex;
function getAccessorFieldName(accessor, index) {
    var _a;
    return typeof accessor === 'function' ? (_a = accessor.fieldName) !== null && _a !== void 0 ? _a : "(index:".concat(index, ")") : accessor;
}
exports.getAccessorFieldName = getAccessorFieldName;
function splitSeriesDataByAccessors(spec, xValueSums, isStacked, stackMode, groupBySpec) {
    var _a, _b, _c, _d, _e;
    if (isStacked === void 0) { isStacked = false; }
    var seriesType = spec.seriesType, specId = spec.id, groupId = spec.groupId, data = spec.data, xAccessor = spec.xAccessor, yAccessors = spec.yAccessors, y0Accessors = spec.y0Accessors, markSizeAccessor = spec.markSizeAccessor, _f = spec.splitSeriesAccessors, splitSeriesAccessors = _f === void 0 ? [] : _f;
    var dataSeries = new Map();
    var xValues = [];
    var nonNumericValues = [];
    if (isStacked && Boolean(y0Accessors === null || y0Accessors === void 0 ? void 0 : y0Accessors.length)) {
        logger_1.Logger.warn("y0Accessors are not allowed with stackAccessors. y0Accessors will be ignored but available under initialY0.");
    }
    var _loop_1 = function (i) {
        var datum = data[i];
        var splitAccessors = getSplitAccessors(datum, splitSeriesAccessors);
        if (splitSeriesAccessors.length > 0 && splitAccessors.size < 1) {
            return "continue";
        }
        if (typeof datum !== 'object' || datum === null) {
            return "continue";
        }
        var x = (0, accessor_1.getAccessorValue)(datum, xAccessor);
        if (typeof x !== 'string' && typeof x !== 'number') {
            return "continue";
        }
        xValues.push(x);
        var sum = (_a = xValueSums.get(x)) !== null && _a !== void 0 ? _a : 0;
        var smH = (_c = (_b = groupBySpec === null || groupBySpec === void 0 ? void 0 : groupBySpec.horizontal) === null || _b === void 0 ? void 0 : _b.by) === null || _c === void 0 ? void 0 : _c.call(_b, spec, datum);
        var smV = (_e = (_d = groupBySpec === null || groupBySpec === void 0 ? void 0 : groupBySpec.vertical) === null || _d === void 0 ? void 0 : _d.by) === null || _e === void 0 ? void 0 : _e.call(_d, spec, datum);
        var xAccessorStr = getAccessorFieldName(xAccessor, 0);
        yAccessors.forEach(function (accessor, index) {
            var _a;
            var cleanedDatum = extractYAndMarkFromDatum(datum, accessor, nonNumericValues, isBandedSpec(spec), y0Accessors && y0Accessors[index], markSizeAccessor);
            var yAccessorStr = getAccessorFieldName(accessor, index);
            var splitAccessorStrs = __spreadArray([], __read(splitAccessors.values()), false).map(function (a, si) { return getAccessorFieldName(a, si); });
            var seriesKeys = __spreadArray(__spreadArray([], __read(splitAccessorStrs), false), [yAccessorStr], false);
            var seriesIdentifier = (0, common_1.stripUndefined)({
                specId: specId,
                seriesKeys: seriesKeys,
                xAccessor: xAccessorStr,
                yAccessor: yAccessorStr,
                splitAccessors: splitAccessors,
                smVerticalAccessorValue: smV,
                smHorizontalAccessorValue: smH,
            });
            var seriesKey = getSeriesKey(seriesIdentifier, groupId);
            sum += (_a = cleanedDatum.y1) !== null && _a !== void 0 ? _a : 0;
            var newDatum = __assign(__assign({ x: x }, cleanedDatum), { smH: smH, smV: smV });
            var series = dataSeries.get(seriesKey);
            if (series) {
                series.data.push(newDatum);
            }
            else {
                dataSeries.set(seriesKey, __assign(__assign({}, seriesIdentifier), { groupId: groupId, seriesType: seriesType, stackMode: stackMode, isStacked: isStacked, seriesKeys: seriesKeys, key: seriesKey, data: [newDatum], spec: spec, insertIndex: 0, isFiltered: false }));
            }
            xValueSums.set(x, sum);
        });
    };
    for (var i = 0; i < data.length; i++) {
        _loop_1(i);
    }
    if (nonNumericValues.length > 0) {
        logger_1.Logger.warn("Found non-numeric y value".concat(nonNumericValues.length > 1 ? 's' : '', " in dataset for spec \"").concat(specId, "\""), "(".concat(nonNumericValues.map(function (v) { return JSON.stringify(v); }).join(', '), ")"));
    }
    return {
        dataSeries: dataSeries,
        xValues: xValues,
    };
}
exports.splitSeriesDataByAccessors = splitSeriesDataByAccessors;
function getSeriesKey(_a, groupId) {
    var specId = _a.specId, yAccessor = _a.yAccessor, splitAccessors = _a.splitAccessors, smVerticalAccessorValue = _a.smVerticalAccessorValue, smHorizontalAccessorValue = _a.smHorizontalAccessorValue;
    var joinedAccessors = __spreadArray([], __read(splitAccessors.entries()), false).sort(function (_a, _b) {
        var _c = __read(_a, 1), a = _c[0];
        var _d = __read(_b, 1), b = _d[0];
        return (a > b ? 1 : -1);
    })
        .map(function (_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        return "".concat(key, "-").concat(value);
    })
        .join('|');
    var smV = smVerticalAccessorValue ? "smV{".concat(smVerticalAccessorValue, "}") : '';
    var smH = smHorizontalAccessorValue ? "smH{".concat(smHorizontalAccessorValue, "}") : '';
    return "groupId{".concat(groupId, "}spec{").concat(specId, "}yAccessor{").concat(yAccessor, "}splitAccessors{").concat(joinedAccessors, "}").concat(smV).concat(smH);
}
exports.getSeriesKey = getSeriesKey;
function getSplitAccessors(datum, accessors) {
    if (accessors === void 0) { accessors = []; }
    var splitAccessors = new Map();
    if (typeof datum === 'object' && datum !== null) {
        accessors.forEach(function (accessor, index) {
            var value = (0, accessor_1.getAccessorValue)(datum, accessor);
            if (typeof value === 'string' || typeof value === 'number') {
                var accessorStr = getAccessorFieldName(accessor, index);
                splitAccessors.set(accessorStr, value);
            }
        });
    }
    return splitAccessors;
}
function extractYAndMarkFromDatum(datum, yAccessor, nonNumericValues, bandedSpec, y0Accessor, markSizeAccessor) {
    var mark = markSizeAccessor === undefined ? null : finiteOrNull((0, accessor_1.getAccessorValue)(datum, markSizeAccessor), nonNumericValues);
    var y1Value = (0, accessor_1.getAccessorValue)(datum, yAccessor);
    var y1 = finiteOrNull(y1Value, nonNumericValues);
    var y0 = y0Accessor ? finiteOrNull((0, accessor_1.getAccessorValue)(datum, y0Accessor), nonNumericValues) : null;
    return { y1: y1, datum: datum, y0: bandedSpec ? y0 : null, mark: mark, initialY0: y0, initialY1: y1 };
}
exports.extractYAndMarkFromDatum = extractYAndMarkFromDatum;
function finiteOrNull(value, nonNumericValues) {
    var candidateNumber = Number(value !== null && value !== void 0 ? value : undefined);
    var finite = Number.isFinite(candidateNumber);
    if (!finite)
        nonNumericValues.push(value);
    return finite ? candidateNumber : null;
}
var getSortedDataSeries = function (dataSeries, xValues, xScaleType) {
    return dataSeries.map(function (_a) {
        var data = _a.data, rest = __rest(_a, ["data"]);
        return (__assign(__assign({}, rest), { data: __spreadArray([], __read(data), false).sort((0, stacked_series_utils_1.datumXSortPredicate)(xScaleType, __spreadArray([], __read(xValues.values()), false))) }));
    });
};
function getFormattedDataSeries(seriesSpecs, availableDataSeries, xValues, xScaleType) {
    var histogramEnabled = (0, y_domain_1.isHistogramEnabled)(seriesSpecs);
    var fittedDataSeries = (0, fit_function_utils_1.applyFitFunctionToDataSeries)(getSortedDataSeries(availableDataSeries, xValues, xScaleType), seriesSpecs, xScaleType);
    var stackedDataSeries = fittedDataSeries.filter(function (_a) {
        var spec = _a.spec;
        return (0, y_domain_1.isStackedSpec)(spec, histogramEnabled);
    });
    var stackedGroups = (0, group_data_series_1.groupBy)(stackedDataSeries, ['smHorizontalAccessorValue', 'smVerticalAccessorValue', 'groupId'], true);
    var fittedAndStackedDataSeries = stackedGroups.reduce(function (acc, dataSeries) {
        var _a = __read(dataSeries, 1), _b = _a[0], stackMode = _b.stackMode, seriesType = _b.seriesType;
        var formatted = (0, stacked_series_utils_1.formatStackedDataSeriesValues)(dataSeries, xValues, seriesType, stackMode);
        return __spreadArray(__spreadArray([], __read(acc), false), __read(formatted), false);
    }, []);
    var nonStackedDataSeries = fittedDataSeries.filter(function (_a) {
        var spec = _a.spec;
        return !(0, y_domain_1.isStackedSpec)(spec, histogramEnabled);
    });
    return __spreadArray(__spreadArray([], __read(fittedAndStackedDataSeries), false), __read(nonStackedDataSeries), false);
}
exports.getFormattedDataSeries = getFormattedDataSeries;
function getDataSeriesFromSpecs(seriesSpecs, deselectedDataSeries, orderOrdinalBinsBy, groupBySpec) {
    var e_1, _a;
    if (deselectedDataSeries === void 0) { deselectedDataSeries = []; }
    var globalDataSeries = [];
    var mutatedXValueSums = new Map();
    var globalXValues = new Set();
    var isNumberArray = true;
    var isOrdinalScale = false;
    var specsByYGroup = (0, y_domain_1.groupSeriesByYGroup)(seriesSpecs);
    var _loop_2 = function (spec) {
        var e_2, _b;
        if (spec.xScaleType === constants_1.ScaleType.Ordinal) {
            isOrdinalScale = true;
        }
        var specGroup = specsByYGroup.get(spec.groupId);
        var isStacked = Boolean(specGroup === null || specGroup === void 0 ? void 0 : specGroup.stacked.find(function (_a) {
            var id = _a.id;
            return id === spec.id;
        }));
        var _c = splitSeriesDataByAccessors(spec, mutatedXValueSums, isStacked, specGroup === null || specGroup === void 0 ? void 0 : specGroup.stackMode, groupBySpec), dataSeries_1 = _c.dataSeries, xValues_2 = _c.xValues;
        var filteredDataSeries = __spreadArray([], __read(dataSeries_1.values()), false);
        if (deselectedDataSeries.length > 0) {
            filteredDataSeries = filteredDataSeries.map(function (series) { return (__assign(__assign({}, series), { isFiltered: deselectedDataSeries.some(function (_a) {
                    var deselectedKey = _a.key;
                    return series.key === deselectedKey;
                }) })); });
        }
        globalDataSeries = __spreadArray(__spreadArray([], __read(globalDataSeries), false), __read(filteredDataSeries), false);
        try {
            for (var xValues_1 = (e_2 = void 0, __values(xValues_2)), xValues_1_1 = xValues_1.next(); !xValues_1_1.done; xValues_1_1 = xValues_1.next()) {
                var xValue = xValues_1_1.value;
                if (isNumberArray && typeof xValue !== 'number') {
                    isNumberArray = false;
                }
                globalXValues.add(xValue);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (xValues_1_1 && !xValues_1_1.done && (_b = xValues_1.return)) _b.call(xValues_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    try {
        for (var seriesSpecs_1 = __values(seriesSpecs), seriesSpecs_1_1 = seriesSpecs_1.next(); !seriesSpecs_1_1.done; seriesSpecs_1_1 = seriesSpecs_1.next()) {
            var spec = seriesSpecs_1_1.value;
            _loop_2(spec);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (seriesSpecs_1_1 && !seriesSpecs_1_1.done && (_a = seriesSpecs_1.return)) _a.call(seriesSpecs_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var xValues = isOrdinalScale || !isNumberArray
        ? getSortedOrdinalXValues(globalXValues, mutatedXValueSums, orderOrdinalBinsBy)
        : new Set(__spreadArray([], __read(globalXValues), false).sort(function (a, b) {
            if (typeof a === 'string' || typeof b === 'string') {
                return 0;
            }
            return a - b;
        }));
    var dataSeries = globalDataSeries.map(function (d, i) { return (__assign(__assign({}, d), { insertIndex: i })); });
    var smallMultipleUniqueValues = dataSeries.reduce(function (acc, curr) {
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
    return __assign(__assign({ dataSeries: dataSeries, xValues: xValues }, smallMultipleUniqueValues), { fallbackScale: !isOrdinalScale && !isNumberArray ? scale_defaults_1.X_SCALE_DEFAULT.type : undefined });
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
            return new Set(__spreadArray([], __read(xValues), false).sort(function (v1, v2) {
                var _a, _b;
                return (orderOrdinalBinsBy.direction === specs_1.Direction.Ascending ? 1 : -1) *
                    (((_a = xValueSums.get(v1)) !== null && _a !== void 0 ? _a : 0) - ((_b = xValueSums.get(v2)) !== null && _b !== void 0 ? _b : 0));
            }));
    }
}
var BIG_NUMBER = Number.MAX_SAFE_INTEGER;
function getSeriesNameFromOptions(options, _a, delimiter) {
    var yAccessor = _a.yAccessor, splitAccessors = _a.splitAccessors;
    if (!options.names) {
        return null;
    }
    return (__spreadArray([], __read(options.names), false).sort(function (_a, _b) {
        var _c = _a.sortIndex, a = _c === void 0 ? BIG_NUMBER : _c;
        var _d = _b.sortIndex, b = _d === void 0 ? BIG_NUMBER : _d;
        return a - b;
    })
        .map(function (_a) {
        var _b;
        var accessor = _a.accessor, value = _a.value, name = _a.name;
        var accessorValue = (_b = splitAccessors.get(accessor)) !== null && _b !== void 0 ? _b : null;
        if (accessorValue === value) {
            return name !== null && name !== void 0 ? name : value;
        }
        if (yAccessor === accessor) {
            return name !== null && name !== void 0 ? name : accessor;
        }
        return null;
    })
        .filter(function (d) { return Boolean(d) || d === 0; })
        .join(delimiter) || null);
}
function getSeriesName(seriesIdentifier, hasSingleSeries, isTooltip, spec) {
    var _a, _b;
    var customLabel = typeof (spec === null || spec === void 0 ? void 0 : spec.name) === 'function'
        ? spec.name(seriesIdentifier, isTooltip)
        : typeof (spec === null || spec === void 0 ? void 0 : spec.name) === 'object'
            ? getSeriesNameFromOptions(spec.name, seriesIdentifier, (_a = spec.name.delimiter) !== null && _a !== void 0 ? _a : exports.SERIES_DELIMITER)
            : null;
    if (customLabel !== null) {
        return customLabel.toString();
    }
    var multipleYAccessors = spec && spec.yAccessors.length > 1;
    var nameKeys = multipleYAccessors ? seriesIdentifier.seriesKeys : seriesIdentifier.seriesKeys.slice(0, -1);
    var nonZeroLength = nameKeys.length > 0;
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
    var tempColor = overrides.temporary[key];
    return tempColor || customColors.get(key) || (tempColor === null ? undefined : overrides.persisted[key]);
}
function getSeriesColors(dataSeries, chartColors, customColors, overrides) {
    var seriesColorMap = new Map();
    var counter = 0;
    var sortedDataSeries = __spreadArray([], __read(dataSeries), false).sort(function (a, b) { return a.insertIndex - b.insertIndex; });
    (0, group_data_series_1.groupBy)(sortedDataSeries, function (ds) {
        return __spreadArray([ds.specId, ds.groupId, ds.yAccessor], __read(ds.splitAccessors.values()), false).join('__');
    }, true).forEach(function (ds) {
        var seriesKey = getSeriesKey({
            specId: ds[0].specId,
            yAccessor: ds[0].yAccessor,
            splitAccessors: ds[0].splitAccessors,
        }, ds[0].groupId);
        var colorOverride = getHighestOverride(seriesKey, customColors, overrides);
        var color = colorOverride || chartColors.vizColors[counter % chartColors.vizColors.length];
        seriesColorMap.set(seriesKey, color);
        counter++;
    });
    return seriesColorMap;
}
exports.getSeriesColors = getSeriesColors;
function getSeriesIdentifierFromDataSeries(dataSeries) {
    var key = dataSeries.key, specId = dataSeries.specId, seriesKeys = dataSeries.seriesKeys, xAccessor = dataSeries.xAccessor, yAccessor = dataSeries.yAccessor, splitAccessors = dataSeries.splitAccessors, smVerticalAccessorValue = dataSeries.smVerticalAccessorValue, smHorizontalAccessorValue = dataSeries.smHorizontalAccessorValue;
    return (0, common_1.stripUndefined)({
        key: key,
        specId: specId,
        seriesKeys: seriesKeys,
        xAccessor: xAccessor,
        yAccessor: yAccessor,
        splitAccessors: splitAccessors,
        smVerticalAccessorValue: smVerticalAccessorValue,
        smHorizontalAccessorValue: smHorizontalAccessorValue,
    });
}
exports.getSeriesIdentifierFromDataSeries = getSeriesIdentifierFromDataSeries;
//# sourceMappingURL=series.js.map