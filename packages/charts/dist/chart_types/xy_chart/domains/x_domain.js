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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertXScaleTypes = exports.findMinInterval = exports.mergeXDomain = void 0;
var constants_1 = require("../../../scales/constants");
var common_1 = require("../../../utils/common");
var domain_1 = require("../../../utils/domain");
var logger_1 = require("../../../utils/logger");
var get_api_scales_1 = require("../scales/get_api_scales");
var specs_1 = require("../utils/specs");
function mergeXDomain(_a, xValues, fallbackScale) {
    var type = _a.type, nice = _a.nice, isBandScale = _a.isBandScale, timeZone = _a.timeZone, desiredTickCount = _a.desiredTickCount, customDomain = _a.customDomain;
    var seriesXComputedDomains;
    var minInterval = 0;
    if (type === constants_1.ScaleType.Ordinal || fallbackScale === constants_1.ScaleType.Ordinal) {
        if (type !== constants_1.ScaleType.Ordinal) {
            logger_1.Logger.warn("Each X value in a ".concat(type, " x scale needs be be a number. Using ordinal x scale as fallback."));
        }
        seriesXComputedDomains = (0, domain_1.computeOrdinalDataDomain)(__spreadArray([], __read(xValues), false), false, true);
        if (customDomain) {
            if (Array.isArray(customDomain)) {
                seriesXComputedDomains = __spreadArray([], __read(customDomain), false);
            }
            else {
                if (fallbackScale === constants_1.ScaleType.Ordinal) {
                    logger_1.Logger.warn("xDomain ignored for fallback ordinal scale. Options to resolve:\n1) Correct data to match ".concat(type, " scale type (see previous warning)\n2) Change xScaleType to ordinal and set xDomain to Domain array"));
                }
                else {
                    logger_1.Logger.warn('xDomain for ordinal scale should be an array of values, not a DomainRange object. xDomain is ignored.');
                }
            }
        }
    }
    else {
        var domainOptions = { min: NaN, max: NaN, fit: true };
        seriesXComputedDomains = (0, domain_1.computeContinuousDataDomain)(__spreadArray([], __read(xValues), false), type, domainOptions);
        var customMinInterval = void 0;
        if (customDomain) {
            if (Array.isArray(customDomain)) {
                logger_1.Logger.warn('xDomain for continuous scale should be a DomainRange object, not an array');
            }
            else {
                customMinInterval = customDomain.minInterval;
                var _b = __read(seriesXComputedDomains, 2), computedDomainMin = _b[0], computedDomainMax = _b[1];
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
        var computedMinInterval = findMinInterval(__spreadArray([], __read(xValues.values()), false));
        minInterval = getMinInterval(computedMinInterval, xValues.size, customMinInterval);
    }
    var validatedTimeZone = timeZone === 'local' || !timeZone ? Intl.DateTimeFormat().resolvedOptions().timeZone : timeZone;
    return {
        type: fallbackScale !== null && fallbackScale !== void 0 ? fallbackScale : type,
        nice: nice,
        isBandScale: isBandScale,
        domain: seriesXComputedDomains,
        minInterval: minInterval,
        timeZone: validatedTimeZone,
        logBase: customDomain && 'logBase' in customDomain ? customDomain.logBase : 10,
        desiredTickCount: desiredTickCount,
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
        : __spreadArray([], __read(xValues), false).sort(common_1.compareByValueAsc).reduce(function (minInterval, current, i, sortedValues) {
            return i < xValues.length - 1 ? Math.min(minInterval, Math.abs(sortedValues[i + 1] - current)) : minInterval;
        }, Infinity);
}
exports.findMinInterval = findMinInterval;
function convertXScaleTypes(specs) {
    var seriesTypes = new Set(specs.map(function (s) { return s.seriesType; }));
    var scaleTypes = new Set(specs.map(function (s) { return (0, get_api_scales_1.getXScaleTypeFromSpec)(s.xScaleType); }));
    var timeZones = new Set(specs.filter(function (s) { return s.timeZone; }).map(function (s) { return s.timeZone.toLowerCase(); }));
    var niceDomains = specs.map(function (s) { return (0, get_api_scales_1.getXNiceFromSpec)(s.xNice); });
    var type = scaleTypes.size === 1
        ? scaleTypes.values().next().value
        : scaleTypes.has(constants_1.ScaleType.Ordinal)
            ? constants_1.ScaleType.Ordinal
            : constants_1.ScaleType.Linear;
    var nice = !niceDomains.includes(false);
    var isBandScale = seriesTypes.has(specs_1.SeriesType.Bar);
    var timeZone = timeZones.size === 1 ? timeZones.values().next().value : 'local';
    return { type: type, nice: nice, isBandScale: isBandScale, timeZone: timeZone };
}
exports.convertXScaleTypes = convertXScaleTypes;
//# sourceMappingURL=x_domain.js.map