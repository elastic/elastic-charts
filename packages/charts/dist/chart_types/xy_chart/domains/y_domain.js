"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coerceYScaleTypes = exports.isStackedSpec = exports.isHistogramEnabled = exports.groupSeriesByYGroup = exports.mergeYDomain = void 0;
const constants_1 = require("../../../scales/constants");
const domain_1 = require("../../../utils/domain");
const logger_1 = require("../../../utils/logger");
const get_api_scales_1 = require("../scales/get_api_scales");
const spec_1 = require("../state/utils/spec");
const group_data_series_1 = require("../utils/group_data_series");
const specs_1 = require("../utils/specs");
function mergeYDomain(yScaleAPIConfig, dataSeries, annotationYValueMap) {
    const dataSeriesByGroupId = (0, group_data_series_1.groupBy)(dataSeries, ({ spec }) => (0, spec_1.getSpecDomainGroupId)(spec), true);
    return dataSeriesByGroupId.reduce((acc, groupedDataSeries) => {
        const stacked = groupedDataSeries.filter(({ isStacked, isFiltered }) => isStacked && !isFiltered);
        const nonStacked = groupedDataSeries.filter(({ isStacked, isFiltered }) => !isStacked && !isFiltered);
        const hasNonZeroBaselineTypes = groupedDataSeries.some(({ seriesType, isFiltered }) => seriesType === specs_1.SeriesType.Bar || (seriesType === specs_1.SeriesType.Area && !isFiltered));
        const domain = mergeYDomainForGroup(stacked, nonStacked, annotationYValueMap, hasNonZeroBaselineTypes, yScaleAPIConfig);
        return domain ? [...acc, domain] : acc;
    }, []);
}
exports.mergeYDomain = mergeYDomain;
function mergeYDomainForGroup(stacked, nonStacked, annotationYValueMap, hasZeroBaselineSpecs, yScaleConfig) {
    var _a;
    const dataSeries = [...stacked, ...nonStacked];
    if (!dataSeries[0])
        return null;
    const [{ isStacked, stackMode, spec }] = dataSeries;
    const groupId = (0, spec_1.getSpecDomainGroupId)(spec);
    const scaleConfig = yScaleConfig[groupId];
    if (!scaleConfig)
        return null;
    const { customDomain, type, nice, desiredTickCount } = scaleConfig;
    const newCustomDomain = customDomain ? { ...customDomain } : { min: NaN, max: NaN };
    const { paddingUnit, padding, constrainPadding } = newCustomDomain;
    let mergedDomain;
    if (isStacked && stackMode === specs_1.StackMode.Percentage) {
        mergedDomain = (0, domain_1.computeContinuousDataDomain)([0, 1], type, customDomain);
    }
    else {
        const annotationData = (_a = annotationYValueMap.get(groupId)) !== null && _a !== void 0 ? _a : [];
        const stackedDomain = computeYDomain(stacked, annotationData, hasZeroBaselineSpecs, type, newCustomDomain);
        const nonStackedDomain = computeYDomain(nonStacked, annotationData, hasZeroBaselineSpecs, type, newCustomDomain);
        mergedDomain = (0, domain_1.computeContinuousDataDomain)([...stackedDomain, ...nonStackedDomain], type, newCustomDomain);
        const [computedDomainMin, computedDomainMax] = mergedDomain;
        if (newCustomDomain && Number.isFinite(newCustomDomain.min) && Number.isFinite(newCustomDomain.max)) {
            mergedDomain = [newCustomDomain.min, newCustomDomain.max];
        }
        else if (newCustomDomain && Number.isFinite(newCustomDomain.min)) {
            if (newCustomDomain.min > computedDomainMax) {
                logger_1.Logger.warn(`custom yDomain for ${groupId} is invalid, custom min is greater than computed max.`);
                mergedDomain = [newCustomDomain.min, newCustomDomain.min];
            }
            else {
                mergedDomain = [newCustomDomain.min, computedDomainMax];
            }
        }
        else if (newCustomDomain && Number.isFinite(newCustomDomain.max)) {
            if (computedDomainMin > newCustomDomain.max) {
                logger_1.Logger.warn(`custom yDomain for ${groupId} is invalid, custom max is less than computed max.`);
                mergedDomain = [newCustomDomain.max, newCustomDomain.max];
            }
            else {
                mergedDomain = [computedDomainMin, newCustomDomain.max];
            }
        }
    }
    return {
        type,
        nice,
        isBandScale: false,
        groupId,
        domain: mergedDomain,
        logBase: customDomain === null || customDomain === void 0 ? void 0 : customDomain.logBase,
        logMinLimit: customDomain === null || customDomain === void 0 ? void 0 : customDomain.logMinLimit,
        desiredTickCount,
        domainPixelPadding: paddingUnit === specs_1.DomainPaddingUnit.Pixel ? padding : 0,
        constrainDomainPadding: constrainPadding,
    };
}
function computeYDomain(dataSeries, annotationYValues, hasZeroBaselineSpecs, scaleType, customDomain) {
    const yValues = new Set();
    dataSeries.forEach(({ data }) => {
        for (const datum of data) {
            yValues.add(datum.y1);
            if (hasZeroBaselineSpecs && datum.y0 !== null)
                yValues.add(datum.y0);
        }
    });
    if (yValues.size === 0) {
        return [];
    }
    const domainOptions = { ...customDomain, padding: 0 };
    return (0, domain_1.computeContinuousDataDomain)([...yValues, ...annotationYValues], scaleType, domainOptions);
}
function groupSeriesByYGroup(specs) {
    const specsByGroupIds = new Map();
    const histogramEnabled = isHistogramEnabled(specs);
    specs.forEach((spec) => {
        const group = specsByGroupIds.get(spec.groupId) || {
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
            logger_1.Logger.warn(`Is not possible to mix different stackModes, please align all stackMode on the same GroupId
      to the same mode. The default behaviour will be to use the first encountered stackMode on the series`);
        }
        specsByGroupIds.set(spec.groupId, group);
    });
    return specsByGroupIds;
}
exports.groupSeriesByYGroup = groupSeriesByYGroup;
function isHistogramEnabled(specs) {
    return specs.some(({ seriesType, enableHistogramMode }) => seriesType === specs_1.SeriesType.Bar && enableHistogramMode);
}
exports.isHistogramEnabled = isHistogramEnabled;
function isStackedSpec(spec, histogramEnabled) {
    const isBarAndHistogram = spec.seriesType === specs_1.SeriesType.Bar && histogramEnabled;
    const hasStackAccessors = spec.stackAccessors && spec.stackAccessors.length > 0;
    return isBarAndHistogram || hasStackAccessors;
}
exports.isStackedSpec = isStackedSpec;
function coerceYScaleTypes(series) {
    const scaleTypes = new Set(series.map((s) => (0, get_api_scales_1.getYScaleTypeFromSpec)(s.yScaleType)));
    const niceDomains = series.map((s) => (0, get_api_scales_1.getYNiceFromSpec)(s.yNice));
    const type = scaleTypes.size === 1 ? scaleTypes.values().next().value : constants_1.ScaleType.Linear;
    return { type, nice: !niceDomains.includes(false) };
}
exports.coerceYScaleTypes = coerceYScaleTypes;
//# sourceMappingURL=y_domain.js.map