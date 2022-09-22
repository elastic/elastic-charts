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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitLogScaleDomain = exports.ScaleContinuous = void 0;
var d3_array_1 = require("d3-array");
var d3_scale_1 = require("d3-scale");
var get_linear_ticks_1 = require("../chart_types/xy_chart/utils/get_linear_ticks");
var screenspace_marker_scale_compressor_1 = require("../solvers/screenspace_marker_scale_compressor");
var common_1 = require("../utils/common");
var date_time_1 = require("../utils/data/date_time");
var constants_1 = require("./constants");
var SCALES = (_a = {},
    _a[constants_1.ScaleType.Linear] = d3_scale_1.scaleLinear,
    _a[constants_1.ScaleType.Log] = d3_scale_1.scaleLog,
    _a[constants_1.ScaleType.Sqrt] = d3_scale_1.scaleSqrt,
    _a[constants_1.ScaleType.Time] = d3_scale_1.scaleUtc,
    _a);
var defaultScaleOptions = {
    bandwidth: 0,
    minInterval: 0,
    timeZone: 'local',
    totalBarsInCluster: 1,
    barsPadding: 0,
    constrainDomainPadding: true,
    domainPixelPadding: 0,
    desiredTickCount: 10,
    isSingleValueHistogram: false,
    integersOnly: false,
    logBase: 10,
    logMinLimit: NaN,
    linearBase: 10,
};
var isUnitRange = function (_a) {
    var _b = __read(_a, 2), r1 = _b[0], r2 = _b[1];
    return r1 === 0 && r2 === 1;
};
var ScaleContinuous = (function () {
    function ScaleContinuous(_a, options) {
        var _b = _a.type, scaleType = _b === void 0 ? constants_1.ScaleType.Linear : _b, inputDomain = _a.domain, range = _a.range, _c = _a.nice, nice = _c === void 0 ? false : _c;
        var isBinary = scaleType === constants_1.ScaleType.LinearBinary;
        var type = isBinary ? constants_1.ScaleType.Linear : scaleType;
        var scaleOptions = (0, common_1.mergePartial)(defaultScaleOptions, options);
        var min = inputDomain.reduce(function (p, n) { return Math.min(p, n); }, Infinity);
        var max = inputDomain.reduce(function (p, n) { return Math.max(p, n); }, -Infinity);
        var properLogScale = type === constants_1.ScaleType.Log && min < max;
        var dataDomain = properLogScale ? limitLogScaleDomain([min, max], scaleOptions.logMinLimit) : inputDomain;
        var barsPadding = (0, common_1.clamp)(scaleOptions.barsPadding, 0, 1);
        var isNice = nice && type !== constants_1.ScaleType.Time;
        var totalRange = Math.abs(range[1] - range[0]);
        var pixelPadFits = 0 < scaleOptions.domainPixelPadding && scaleOptions.domainPixelPadding * 2 < totalRange;
        var isPixelPadded = pixelPadFits && type !== constants_1.ScaleType.Time && !isUnitRange(range);
        var minInterval = Math.abs(scaleOptions.minInterval);
        var bandwidth = scaleOptions.bandwidth * (1 - barsPadding);
        var bandwidthPadding = scaleOptions.bandwidth * barsPadding;
        this.barsPadding = barsPadding;
        this.bandwidth = bandwidth;
        this.bandwidthPadding = bandwidthPadding;
        this.type = type;
        this.range = range;
        this.linearBase = isBinary ? 2 : scaleOptions.linearBase;
        this.minInterval = minInterval;
        this.step = bandwidth + barsPadding + bandwidthPadding;
        this.timeZone = scaleOptions.timeZone;
        this.isInverted = dataDomain[0] > dataDomain[1];
        this.totalBarsInCluster = scaleOptions.totalBarsInCluster;
        this.isSingleValueHistogram = scaleOptions.isSingleValueHistogram;
        var d3Scale = SCALES[type]();
        d3Scale.domain(dataDomain);
        d3Scale.range(range);
        if (properLogScale)
            d3Scale.base(scaleOptions.logBase);
        if (isNice) {
            if (type === constants_1.ScaleType.Linear) {
                (0, get_linear_ticks_1.getNiceLinearTicks)(d3Scale, scaleOptions.desiredTickCount, this.linearBase);
            }
            else {
                d3Scale
                    .domain(dataDomain)
                    .nice(scaleOptions.desiredTickCount);
            }
        }
        var niceDomain = isNice ? d3Scale.domain() : dataDomain;
        var paddedDomain = isPixelPadded
            ? getPixelPaddedDomain(totalRange, niceDomain, scaleOptions.domainPixelPadding, scaleOptions.constrainDomainPadding)
            : niceDomain;
        d3Scale.domain(paddedDomain);
        if (isPixelPadded && isNice)
            d3Scale.nice(scaleOptions.desiredTickCount);
        var nicePaddedDomain = isPixelPadded && isNice ? d3Scale.domain() : paddedDomain;
        this.tickValues =
            type === constants_1.ScaleType.Time
                ? getTimeTicks(nicePaddedDomain, scaleOptions.desiredTickCount, scaleOptions.timeZone, scaleOptions.bandwidth === 0 ? 0 : scaleOptions.minInterval)
                : type === constants_1.ScaleType.Linear
                    ? getLinearNonDenserTicks(nicePaddedDomain, scaleOptions.desiredTickCount, this.linearBase, scaleOptions.bandwidth === 0 ? 0 : scaleOptions.minInterval)
                    : d3Scale.ticks(scaleOptions.desiredTickCount);
        this.domain = nicePaddedDomain;
        this.project = function (d) { var _a; return (_a = d3Scale(d)) !== null && _a !== void 0 ? _a : NaN; };
        this.inverseProject = function (d) { var _a; return (_a = d3Scale.invert(d)) !== null && _a !== void 0 ? _a : NaN; };
    }
    ScaleContinuous.prototype.scale = function (value) {
        return typeof value === 'number'
            ? this.project(value) + (this.bandwidthPadding / 2) * this.totalBarsInCluster
            : NaN;
    };
    ScaleContinuous.prototype.pureScale = function (value) {
        return typeof value === 'number' ? this.project(this.bandwidth === 0 ? value : value + this.minInterval / 2) : NaN;
    };
    ScaleContinuous.prototype.ticks = function () {
        return this.tickValues;
    };
    ScaleContinuous.prototype.invert = function (value) {
        var invertedValue = this.inverseProject(value);
        return this.type === constants_1.ScaleType.Time
            ? (0, date_time_1.getMomentWithTz)(invertedValue, this.timeZone).valueOf()
            : Number(invertedValue);
    };
    ScaleContinuous.prototype.invertWithStep = function (value, data) {
        if (data.length === 0) {
            return { withinBandwidth: false, value: NaN };
        }
        var invertedValue = this.invert(value);
        var bisectValue = this.bandwidth === 0 ? invertedValue + this.minInterval / 2 : invertedValue;
        var leftIndex = (0, d3_array_1.bisectLeft)(data, bisectValue);
        if (leftIndex === 0) {
            var withinBandwidth_1 = invertedValue >= data[0];
            return {
                withinBandwidth: withinBandwidth_1,
                value: data[0] + (withinBandwidth_1 ? 0 : -this.minInterval * Math.ceil((data[0] - invertedValue) / this.minInterval)),
            };
        }
        var currentValue = data[leftIndex - 1];
        if (this.bandwidth === 0) {
            var nextValue = data[leftIndex];
            var nextDiff = Math.abs(nextValue - invertedValue);
            var prevDiff = Math.abs(invertedValue - currentValue);
            return {
                withinBandwidth: true,
                value: nextDiff <= prevDiff ? nextValue : currentValue,
            };
        }
        var withinBandwidth = invertedValue - currentValue <= this.minInterval;
        return {
            withinBandwidth: withinBandwidth,
            value: currentValue +
                (withinBandwidth ? 0 : this.minInterval * Math.floor((invertedValue - currentValue) / this.minInterval)),
        };
    };
    ScaleContinuous.prototype.isSingleValue = function () {
        return this.isSingleValueHistogram || isDegenerateDomain(this.domain);
    };
    ScaleContinuous.prototype.isValueInDomain = function (value) {
        return (0, common_1.isFiniteNumber)(value) && this.domain[0] <= value && value <= this.domain[1];
    };
    return ScaleContinuous;
}());
exports.ScaleContinuous = ScaleContinuous;
function getTimeTicks(domain, desiredTickCount, timeZone, minInterval) {
    var startDomain = (0, date_time_1.getMomentWithTz)(domain[0], timeZone);
    var endDomain = (0, date_time_1.getMomentWithTz)(domain[1], timeZone);
    var offset = startDomain.utcOffset();
    var shiftedDomainMin = startDomain.add(offset, 'minutes').valueOf();
    var shiftedDomainMax = endDomain.add(offset, 'minutes').valueOf();
    var tzShiftedScale = (0, d3_scale_1.scaleUtc)().domain([shiftedDomainMin, shiftedDomainMax]);
    var currentCount = desiredTickCount;
    var rawTicks = tzShiftedScale.ticks(desiredTickCount);
    while (rawTicks.length > 2 && currentCount > 0 && rawTicks[1].valueOf() - rawTicks[0].valueOf() < minInterval) {
        currentCount--;
        rawTicks = tzShiftedScale.ticks(currentCount);
    }
    var timePerTick = (shiftedDomainMax - shiftedDomainMin) / rawTicks.length;
    var hasHourTicks = timePerTick < 1000 * 60 * 60 * 12;
    return rawTicks.map(function (d) {
        var currentDateTime = (0, date_time_1.getMomentWithTz)(d, timeZone);
        var currentOffset = hasHourTicks ? offset : currentDateTime.utcOffset();
        return currentDateTime.subtract(currentOffset, 'minutes').valueOf();
    });
}
function getLinearNonDenserTicks(domain, desiredTickCount, base, minInterval) {
    var start = domain[0];
    var stop = domain[domain.length - 1];
    var currentCount = desiredTickCount;
    var ticks = (0, get_linear_ticks_1.getLinearTicks)(start, stop, desiredTickCount, base);
    while (ticks.length > 2 && currentCount > 0 && ticks[1] - ticks[0] < minInterval) {
        currentCount--;
        ticks = (0, get_linear_ticks_1.getLinearTicks)(start, stop, currentCount, base);
    }
    return ticks;
}
function isDegenerateDomain(domain) {
    return domain.every(function (v) { return v === domain[0]; });
}
function limitLogScaleDomain(_a, logMinLimit) {
    var _b = __read(_a, 2), min = _b[0], max = _b[1];
    var absLimit = Math.abs(logMinLimit);
    var fallback = absLimit || constants_1.LOG_MIN_ABS_DOMAIN;
    if (absLimit > 0 && min > 0 && min < absLimit)
        return max > absLimit ? [absLimit, max] : [absLimit, absLimit];
    if (absLimit > 0 && max < 0 && max > -absLimit)
        return min < -absLimit ? [min, -absLimit] : [-absLimit, -absLimit];
    if (min === 0)
        return max > 0 ? [fallback, max] : max < 0 ? [-fallback, max] : [fallback, fallback];
    if (max === 0)
        return min > 0 ? [min, fallback] : min < 0 ? [min, -fallback] : [fallback, fallback];
    if (min < 0 && max > 0)
        return Math.abs(max) >= Math.abs(min) ? [fallback, max] : [min, -fallback];
    if (min > 0 && max < 0)
        return Math.abs(min) >= Math.abs(max) ? [min, fallback] : [-fallback, max];
    return [min, max];
}
exports.limitLogScaleDomain = limitLogScaleDomain;
function getPixelPaddedDomain(chartHeight, domain, desiredPixelPadding, constrainDomainPadding, intercept) {
    if (intercept === void 0) { intercept = 0; }
    var inverted = domain[1] < domain[0];
    var orderedDomain = inverted ? [domain[1], domain[0]] : domain;
    var scaleMultiplier = (0, screenspace_marker_scale_compressor_1.screenspaceMarkerScaleCompressor)(orderedDomain, [
        [desiredPixelPadding, desiredPixelPadding],
        [desiredPixelPadding, desiredPixelPadding],
    ], chartHeight).scaleMultiplier;
    var baselinePaddedDomainLo = orderedDomain[0] - desiredPixelPadding / scaleMultiplier;
    var baselinePaddedDomainHigh = orderedDomain[1] + desiredPixelPadding / scaleMultiplier;
    var crossBelow = constrainDomainPadding && baselinePaddedDomainLo < intercept && orderedDomain[0] >= intercept;
    var crossAbove = constrainDomainPadding && baselinePaddedDomainHigh > 0 && orderedDomain[1] <= 0;
    var paddedDomainLo = crossBelow
        ? intercept
        : crossAbove
            ? orderedDomain[0] -
                desiredPixelPadding /
                    (0, screenspace_marker_scale_compressor_1.screenspaceMarkerScaleCompressor)([orderedDomain[0], intercept], [
                        [desiredPixelPadding, desiredPixelPadding],
                        [0, 0],
                    ], chartHeight).scaleMultiplier
            : baselinePaddedDomainLo;
    var paddedDomainHigh = crossBelow
        ? orderedDomain[1] +
            desiredPixelPadding /
                (0, screenspace_marker_scale_compressor_1.screenspaceMarkerScaleCompressor)([intercept, orderedDomain[1]], [
                    [0, 0],
                    [desiredPixelPadding, desiredPixelPadding],
                ], chartHeight).scaleMultiplier
        : crossAbove
            ? intercept
            : baselinePaddedDomainHigh;
    return inverted ? [paddedDomainHigh, paddedDomainLo] : [paddedDomainLo, paddedDomainHigh];
}
//# sourceMappingURL=scale_continuous.js.map