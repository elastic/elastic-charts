"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertXScaleTypes = exports.findMinInterval = exports.mergeXDomain = void 0;
const constants_1 = require("../../../scales/constants");
const common_1 = require("../../../utils/common");
const domain_1 = require("../../../utils/domain");
const logger_1 = require("../../../utils/logger");
const time_zone_1 = require("../../../utils/time_zone");
const get_api_scales_1 = require("../scales/get_api_scales");
const specs_1 = require("../utils/specs");
function mergeXDomain({ type, nice, isBandScale, timeZone, desiredTickCount, customDomain }, xValues, locale, fallbackScale) {
    let seriesXComputedDomains;
    let minInterval = 0;
    if (type === constants_1.ScaleType.Ordinal || fallbackScale === constants_1.ScaleType.Ordinal) {
        if (type !== constants_1.ScaleType.Ordinal) {
            logger_1.Logger.warn(`Each X value in a ${type} x scale needs be be a number. Using ordinal x scale as fallback.`);
        }
        seriesXComputedDomains = (0, domain_1.computeOrdinalDataDomain)([...xValues], false, true, locale);
        if (customDomain) {
            if (Array.isArray(customDomain)) {
                seriesXComputedDomains = [...customDomain];
            }
            else {
                if (fallbackScale === constants_1.ScaleType.Ordinal) {
                    logger_1.Logger.warn(`xDomain ignored for fallback ordinal scale. Options to resolve:
1) Correct data to match ${type} scale type (see previous warning)
2) Change xScaleType to ordinal and set xDomain to Domain array`);
                }
                else {
                    logger_1.Logger.warn('xDomain for ordinal scale should be an array of values, not a DomainRange object. xDomain is ignored.');
                }
            }
        }
    }
    else {
        const domainOptions = { min: NaN, max: NaN, fit: true };
        seriesXComputedDomains = (0, domain_1.computeContinuousDataDomain)([...xValues], type, domainOptions);
        let customMinInterval;
        if (customDomain) {
            if (Array.isArray(customDomain)) {
                logger_1.Logger.warn('xDomain for continuous scale should be a DomainRange object, not an array');
            }
            else {
                customMinInterval = customDomain.minInterval;
                const [computedDomainMin, computedDomainMax] = seriesXComputedDomains;
                if (Number.isFinite(customDomain.min) && Number.isFinite(customDomain.max)) {
                    if (customDomain.min > customDomain.max) {
                        logger_1.Logger.warn('Custom xDomain is invalid: min is greater than max. Custom domain is ignored.');
                    }
                    else {
                        seriesXComputedDomains = [customDomain.min, customDomain.max];
                    }
                }
                else if (Number.isFinite(customDomain.min)) {
                    if (customDomain.min > computedDomainMax) {
                        logger_1.Logger.warn('Custom xDomain is invalid: custom min is greater than computed max. Custom domain is ignored.');
                    }
                    else {
                        seriesXComputedDomains = [customDomain.min, computedDomainMax];
                    }
                }
                else if (Number.isFinite(customDomain.max)) {
                    if (computedDomainMin > customDomain.max) {
                        logger_1.Logger.warn('Custom xDomain is invalid: computed min is greater than custom max. Custom domain is ignored.');
                    }
                    else {
                        seriesXComputedDomains = [computedDomainMin, customDomain.max];
                    }
                }
            }
        }
        const computedMinInterval = findMinInterval([...xValues.values()]);
        minInterval = getMinInterval(computedMinInterval, xValues.size, customMinInterval);
    }
    return {
        type: fallbackScale !== null && fallbackScale !== void 0 ? fallbackScale : type,
        nice,
        isBandScale,
        domain: seriesXComputedDomains,
        minInterval,
        timeZone: (0, time_zone_1.getValidatedTimeZone)(timeZone),
        logBase: customDomain && 'logBase' in customDomain ? customDomain.logBase : 10,
        desiredTickCount,
    };
}
exports.mergeXDomain = mergeXDomain;
function getMinInterval(computedMinInterval, size, customMinInterval) {
    if (customMinInterval === undefined) {
        return computedMinInterval;
    }
    if (size > 1 && customMinInterval > computedMinInterval) {
        logger_1.Logger.warn('Custom xDomain is invalid: custom minInterval is greater than computed minInterval. Using computed minInterval.');
        return computedMinInterval;
    }
    if (customMinInterval < 0) {
        logger_1.Logger.warn('Custom xDomain is invalid: custom minInterval is less than 0. Using computed minInterval.');
        return computedMinInterval;
    }
    return customMinInterval;
}
function findMinInterval(xValues) {
    return xValues.length < 2
        ? xValues.length
        : [...xValues].sort(common_1.compareByValueAsc).reduce((minInterval, current, i, sortedValues) => {
            var _a;
            return i < xValues.length - 1
                ? Math.min(minInterval, Math.abs(((_a = sortedValues[i + 1]) !== null && _a !== void 0 ? _a : 0) - current))
                : minInterval;
        }, Infinity);
}
exports.findMinInterval = findMinInterval;
function convertXScaleTypes(specs) {
    const seriesTypes = new Set(specs.map((s) => s.seriesType));
    const scaleTypes = new Set(specs.map((s) => (0, get_api_scales_1.getXScaleTypeFromSpec)(s.xScaleType)));
    const niceDomains = specs.map((s) => (0, get_api_scales_1.getXNiceFromSpec)(s.xNice));
    const timeZone = (0, time_zone_1.getZoneFromSpecs)(specs);
    const type = scaleTypes.size === 1
        ? scaleTypes.values().next().value
        : scaleTypes.has(constants_1.ScaleType.Ordinal)
            ? constants_1.ScaleType.Ordinal
            : constants_1.ScaleType.Linear;
    const nice = !niceDomains.includes(false);
    const isBandScale = seriesTypes.has(specs_1.SeriesType.Bar);
    return { type, nice, isBandScale, timeZone };
}
exports.convertXScaleTypes = convertXScaleTypes;
//# sourceMappingURL=x_domain.js.map