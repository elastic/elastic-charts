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
exports.coerceYScaleTypes = exports.isStackedSpec = exports.isHistogramEnabled = exports.groupSeriesByYGroup = exports.mergeYDomain = void 0;
var constants_1 = require("../../../scales/constants");
var domain_1 = require("../../../utils/domain");
var logger_1 = require("../../../utils/logger");
var get_api_scales_1 = require("../scales/get_api_scales");
var spec_1 = require("../state/utils/spec");
var group_data_series_1 = require("../utils/group_data_series");
var specs_1 = require("../utils/specs");
function mergeYDomain(yScaleAPIConfig, dataSeries, annotationYValueMap) {
    var dataSeriesByGroupId = (0, group_data_series_1.groupBy)(dataSeries, function (_a) {
        var spec = _a.spec;
        return (0, spec_1.getSpecDomainGroupId)(spec);
    }, true);
    return dataSeriesByGroupId.reduce(function (acc, groupedDataSeries) {
        var stacked = groupedDataSeries.filter(function (_a) {
            var isStacked = _a.isStacked, isFiltered = _a.isFiltered;
            return isStacked && !isFiltered;
        });
        var nonStacked = groupedDataSeries.filter(function (_a) {
            var isStacked = _a.isStacked, isFiltered = _a.isFiltered;
            return !isStacked && !isFiltered;
        });
        var hasNonZeroBaselineTypes = groupedDataSeries.some(function (_a) {
            var seriesType = _a.seriesType, isFiltered = _a.isFiltered;
            return seriesType === specs_1.SeriesType.Bar || (seriesType === specs_1.SeriesType.Area && !isFiltered);
        });
        var domain = mergeYDomainForGroup(stacked, nonStacked, annotationYValueMap, hasNonZeroBaselineTypes, yScaleAPIConfig);
        return domain ? __spreadArray(__spreadArray([], __read(acc), false), [domain], false) : acc;
    }, []);
}
exports.mergeYDomain = mergeYDomain;
function mergeYDomainForGroup(stacked, nonStacked, annotationYValueMap, hasZeroBaselineSpecs, yScaleConfig) {
    var _a;
    var dataSeries = __spreadArray(__spreadArray([], __read(stacked), false), __read(nonStacked), false);
    if (dataSeries.length === 0)
        return null;
    var _b = __read(dataSeries, 1), _c = _b[0], isStacked = _c.isStacked, stackMode = _c.stackMode, spec = _c.spec;
    var groupId = (0, spec_1.getSpecDomainGroupId)(spec);
    var _d = yScaleConfig[groupId], customDomain = _d.customDomain, type = _d.type, nice = _d.nice, desiredTickCount = _d.desiredTickCount;
    var newCustomDomain = customDomain ? __assign({}, customDomain) : { min: NaN, max: NaN };
    var paddingUnit = newCustomDomain.paddingUnit, padding = newCustomDomain.padding, constrainPadding = newCustomDomain.constrainPadding;
    var mergedDomain;
    if (isStacked && stackMode === specs_1.StackMode.Percentage) {
        mergedDomain = (0, domain_1.computeContinuousDataDomain)([0, 1], type, customDomain);
    }
    else {
        var annotationData = (_a = annotationYValueMap.get(groupId)) !== null && _a !== void 0 ? _a : [];
        var stackedDomain = computeYDomain(stacked, annotationData, hasZeroBaselineSpecs, type, newCustomDomain);
        var nonStackedDomain = computeYDomain(nonStacked, annotationData, hasZeroBaselineSpecs, type, newCustomDomain);
        mergedDomain = (0, domain_1.computeContinuousDataDomain)(__spreadArray(__spreadArray([], __read(stackedDomain), false), __read(nonStackedDomain), false), type, newCustomDomain);
        var _e = __read(mergedDomain, 2), computedDomainMin = _e[0], computedDomainMax = _e[1];
        if (newCustomDomain && Number.isFinite(newCustomDomain.min) && Number.isFinite(newCustomDomain.max)) {
            mergedDomain = [newCustomDomain.min, newCustomDomain.max];
        }
        else if (newCustomDomain && Number.isFinite(newCustomDomain.min)) {
            if (newCustomDomain.min > computedDomainMax) {
                logger_1.Logger.warn("custom yDomain for ".concat(groupId, " is invalid, custom min is greater than computed max."));
                mergedDomain = [newCustomDomain.min, newCustomDomain.min];
            }
            else {
                mergedDomain = [newCustomDomain.min, computedDomainMax];
            }
        }
        else if (newCustomDomain && Number.isFinite(newCustomDomain.max)) {
            if (computedDomainMin > newCustomDomain.max) {
                logger_1.Logger.warn("custom yDomain for ".concat(groupId, " is invalid, custom max is less than computed max."));
                mergedDomain = [newCustomDomain.max, newCustomDomain.max];
            }
            else {
                mergedDomain = [computedDomainMin, newCustomDomain.max];
            }
        }
    }
    return {
        type: type,
        nice: nice,
        isBandScale: false,
        groupId: groupId,
        domain: mergedDomain,
        logBase: customDomain === null || customDomain === void 0 ? void 0 : customDomain.logBase,
        logMinLimit: customDomain === null || customDomain === void 0 ? void 0 : customDomain.logMinLimit,
        desiredTickCount: desiredTickCount,
        domainPixelPadding: paddingUnit === specs_1.DomainPaddingUnit.Pixel ? padding : 0,
        constrainDomainPadding: constrainPadding,
    };
}
function computeYDomain(dataSeries, annotationYValues, hasZeroBaselineSpecs, scaleType, customDomain) {
    var yValues = new Set();
    dataSeries.forEach(function (_a) {
        var e_1, _b;
        var data = _a.data;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                yValues.add(datum.y1);
                if (hasZeroBaselineSpecs && datum.y0 !== null)
                    yValues.add(datum.y0);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_b = data_1.return)) _b.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
    if (yValues.size === 0) {
        return [];
    }
    var domainOptions = __assign(__assign({}, customDomain), { padding: 0 });
    return (0, domain_1.computeContinuousDataDomain)(__spreadArray(__spreadArray([], __read(yValues), false), __read(annotationYValues), false), scaleType, domainOptions);
}
function groupSeriesByYGroup(specs) {
    var specsByGroupIds = new Map();
    var histogramEnabled = isHistogramEnabled(specs);
    specs.forEach(function (spec) {
        var group = specsByGroupIds.get(spec.groupId) || {
            stackMode: undefined,
            stacked: [],
            nonStacked: [],
        };
        if (isStackedSpec(spec, histogramEnabled)) {
            group.stacked.push(spec);
        }
        else {
            group.nonStacked.push(spec);
        }
        if (group.stackMode === undefined && spec.stackMode !== undefined) {
            group.stackMode = spec.stackMode;
        }
        if (spec.stackMode !== undefined && group.stackMode !== undefined && group.stackMode !== spec.stackMode) {
            logger_1.Logger.warn("Is not possible to mix different stackModes, please align all stackMode on the same GroupId\n      to the same mode. The default behaviour will be to use the first encountered stackMode on the series");
        }
        specsByGroupIds.set(spec.groupId, group);
    });
    return specsByGroupIds;
}
exports.groupSeriesByYGroup = groupSeriesByYGroup;
function isHistogramEnabled(specs) {
    return specs.some(function (_a) {
        var seriesType = _a.seriesType, enableHistogramMode = _a.enableHistogramMode;
        return seriesType === specs_1.SeriesType.Bar && enableHistogramMode;
    });
}
exports.isHistogramEnabled = isHistogramEnabled;
function isStackedSpec(spec, histogramEnabled) {
    var isBarAndHistogram = spec.seriesType === specs_1.SeriesType.Bar && histogramEnabled;
    var hasStackAccessors = spec.stackAccessors && spec.stackAccessors.length > 0;
    return isBarAndHistogram || hasStackAccessors;
}
exports.isStackedSpec = isStackedSpec;
function coerceYScaleTypes(series) {
    var scaleTypes = new Set(series.map(function (s) { return (0, get_api_scales_1.getYScaleTypeFromSpec)(s.yScaleType); }));
    var niceDomains = series.map(function (s) { return (0, get_api_scales_1.getYNiceFromSpec)(s.yNice); });
    var type = scaleTypes.size === 1 ? scaleTypes.values().next().value : constants_1.ScaleType.Linear;
    return { type: type, nice: !niceDomains.includes(false) };
}
exports.coerceYScaleTypes = coerceYScaleTypes;
//# sourceMappingURL=y_domain.js.map