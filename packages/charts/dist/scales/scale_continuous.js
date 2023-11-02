"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitLogScaleDomain = exports.ScaleContinuous = void 0;
const d3_array_1 = require("d3-array");
const d3_scale_1 = require("d3-scale");
const constants_1 = require("./constants");
const get_linear_ticks_1 = require("../chart_types/xy_chart/utils/get_linear_ticks");
const screenspace_marker_scale_compressor_1 = require("../solvers/screenspace_marker_scale_compressor");
const common_1 = require("../utils/common");
const date_time_1 = require("../utils/data/date_time");
const SCALES = {
    [constants_1.ScaleType.Linear]: d3_scale_1.scaleLinear,
    [constants_1.ScaleType.Log]: d3_scale_1.scaleLog,
    [constants_1.ScaleType.Sqrt]: d3_scale_1.scaleSqrt,
    [constants_1.ScaleType.Time]: d3_scale_1.scaleUtc,
};
const defaultScaleOptions = {
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
const isUnitRange = ([r1, r2]) => r1 === 0 && r2 === 1;
class ScaleContinuous {
    constructor({ type: scaleType = constants_1.ScaleType.Linear, domain: inputDomain, range, nice = false }, options) {
        const isBinary = scaleType === constants_1.ScaleType.LinearBinary;
        const type = isBinary ? constants_1.ScaleType.Linear : scaleType;
        const scaleOptions = (0, common_1.mergePartial)(defaultScaleOptions, options);
        const min = inputDomain.reduce((p, n) => Math.min(p, n), Infinity);
        const max = inputDomain.reduce((p, n) => Math.max(p, n), -Infinity);
        const properLogScale = type === constants_1.ScaleType.Log && min < max;
        const dataDomain = properLogScale ? limitLogScaleDomain([min, max], scaleOptions.logMinLimit) : inputDomain;
        const barsPadding = (0, common_1.clamp)(scaleOptions.barsPadding, 0, 1);
        const isNice = nice && type !== constants_1.ScaleType.Time;
        const totalRange = Math.abs(range[1] - range[0]);
        const pixelPadFits = 0 < scaleOptions.domainPixelPadding && scaleOptions.domainPixelPadding * 2 < totalRange;
        const isPixelPadded = pixelPadFits && type !== constants_1.ScaleType.Time && !isUnitRange(range);
        const minInterval = Math.abs(scaleOptions.minInterval);
        const bandwidth = scaleOptions.bandwidth * (1 - barsPadding);
        const bandwidthPadding = scaleOptions.bandwidth * barsPadding;
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
        const d3Scale = SCALES[type]();
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
        const niceDomain = isNice ? d3Scale.domain() : dataDomain;
        const paddedDomain = isPixelPadded
            ? getPixelPaddedDomain(totalRange, niceDomain, scaleOptions.domainPixelPadding, scaleOptions.constrainDomainPadding)
            : niceDomain;
        d3Scale.domain(paddedDomain);
        if (isPixelPadded && isNice)
            d3Scale.nice(scaleOptions.desiredTickCount);
        const nicePaddedDomain = isPixelPadded && isNice ? d3Scale.domain() : paddedDomain;
        this.tickValues =
            type === constants_1.ScaleType.Time
                ? getTimeTicks(nicePaddedDomain, scaleOptions.desiredTickCount, scaleOptions.timeZone, scaleOptions.bandwidth === 0 ? 0 : scaleOptions.minInterval)
                : (type === constants_1.ScaleType.Linear
                    ? getLinearNonDenserTicks(nicePaddedDomain, scaleOptions.desiredTickCount, this.linearBase, scaleOptions.bandwidth === 0 ? 0 : scaleOptions.minInterval)
                    : d3Scale.ticks(scaleOptions.desiredTickCount)).filter(scaleOptions.integersOnly ? Number.isInteger : () => true);
        this.domain = nicePaddedDomain;
        this.project = (d) => { var _a; return (_a = d3Scale(d)) !== null && _a !== void 0 ? _a : NaN; };
        this.inverseProject = (d) => { var _a; return (_a = d3Scale.invert(d)) !== null && _a !== void 0 ? _a : NaN; };
    }
    scale(value) {
        return typeof value === 'number'
            ? this.project(value) + (this.bandwidthPadding / 2) * this.totalBarsInCluster
            : NaN;
    }
    pureScale(value) {
        return typeof value === 'number' ? this.project(this.bandwidth === 0 ? value : value + this.minInterval / 2) : NaN;
    }
    ticks() {
        return this.tickValues;
    }
    invert(value) {
        const invertedValue = this.inverseProject(value);
        return this.type === constants_1.ScaleType.Time
            ? (0, date_time_1.getMomentWithTz)(invertedValue, this.timeZone).valueOf()
            : Number(invertedValue);
    }
    invertWithStep(value, data) {
        var _a, _b;
        if (data.length === 0) {
            return { withinBandwidth: false, value: NaN };
        }
        const invertedValue = this.invert(value);
        const bisectValue = this.bandwidth === 0 ? invertedValue + this.minInterval / 2 : invertedValue;
        const leftIndex = (0, d3_array_1.bisectLeft)(data, bisectValue);
        if (leftIndex === 0) {
            const [dataValue = NaN] = data;
            const withinBandwidth = invertedValue >= dataValue;
            return {
                withinBandwidth,
                value: dataValue +
                    (withinBandwidth ? 0 : -this.minInterval * Math.ceil((dataValue - invertedValue) / this.minInterval)),
            };
        }
        const currentValue = (_a = data[leftIndex - 1]) !== null && _a !== void 0 ? _a : NaN;
        if (this.bandwidth === 0) {
            const nextValue = (_b = data[leftIndex]) !== null && _b !== void 0 ? _b : NaN;
            const nextDiff = Math.abs(nextValue - invertedValue);
            const prevDiff = Math.abs(invertedValue - currentValue);
            return {
                withinBandwidth: true,
                value: nextDiff <= prevDiff ? nextValue : currentValue,
            };
        }
        const withinBandwidth = invertedValue - currentValue <= this.minInterval;
        return {
            withinBandwidth,
            value: currentValue +
                (withinBandwidth ? 0 : this.minInterval * Math.floor((invertedValue - currentValue) / this.minInterval)),
        };
    }
    isDegenerateDomain() {
        return this.domain.every((v) => v === this.domain[0]);
    }
    isSingleValue() {
        return this.isSingleValueHistogram || this.isDegenerateDomain();
    }
    isValueInDomain(value) {
        const [start = NaN, end = NaN] = this.domain;
        return (0, common_1.isFiniteNumber)(value) && start <= value && value <= end;
    }
}
exports.ScaleContinuous = ScaleContinuous;
function getTimeTicks(domain, desiredTickCount, timeZone, minInterval) {
    const [start, end] = domain;
    const startDomain = (0, date_time_1.getMomentWithTz)(start, timeZone);
    const endDomain = (0, date_time_1.getMomentWithTz)(end, timeZone);
    const offset = startDomain.utcOffset();
    const shiftedDomainMin = startDomain.add(offset, 'minutes').valueOf();
    const shiftedDomainMax = endDomain.add(offset, 'minutes').valueOf();
    const tzShiftedScale = (0, d3_scale_1.scaleUtc)().domain([shiftedDomainMin, shiftedDomainMax]);
    let currentCount = desiredTickCount;
    let rawTicks = tzShiftedScale.ticks(desiredTickCount);
    while (rawTicks.length > 2 &&
        currentCount > 0 &&
        (0, common_1.isDefined)(rawTicks[0]) &&
        (0, common_1.isDefined)(rawTicks[1]) &&
        rawTicks[1].valueOf() - rawTicks[0].valueOf() < minInterval) {
        currentCount--;
        rawTicks = tzShiftedScale.ticks(currentCount);
    }
    const timePerTick = (shiftedDomainMax - shiftedDomainMin) / rawTicks.length;
    const hasHourTicks = timePerTick < 1000 * 60 * 60 * 12;
    return rawTicks.map((d) => {
        const currentDateTime = (0, date_time_1.getMomentWithTz)(d, timeZone);
        const currentOffset = hasHourTicks ? offset : currentDateTime.utcOffset();
        return currentDateTime.subtract(currentOffset, 'minutes').valueOf();
    });
}
function getLinearNonDenserTicks(domain, desiredTickCount, base, minInterval) {
    const [start, stop] = domain;
    let currentCount = desiredTickCount;
    let ticks = (0, get_linear_ticks_1.getLinearTicks)(start, stop, desiredTickCount, base);
    while (ticks.length > 2 &&
        currentCount > 0 &&
        (0, common_1.isDefined)(ticks[0]) &&
        (0, common_1.isDefined)(ticks[1]) &&
        ticks[1] - ticks[0] < minInterval) {
        currentCount--;
        ticks = (0, get_linear_ticks_1.getLinearTicks)(start, stop, currentCount, base);
    }
    return ticks;
}
function limitLogScaleDomain([min, max], logMinLimit) {
    const absLimit = Math.abs(logMinLimit);
    const fallback = absLimit || constants_1.LOG_MIN_ABS_DOMAIN;
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
function getPixelPaddedDomain(chartHeight, domain, desiredPixelPadding, constrainDomainPadding, intercept = 0) {
    const inverted = domain[1] < domain[0];
    const orderedDomain = inverted ? [domain[1], domain[0]] : domain;
    const { scaleMultiplier } = (0, screenspace_marker_scale_compressor_1.screenspaceMarkerScaleCompressor)(orderedDomain, [
        [desiredPixelPadding, desiredPixelPadding],
        [desiredPixelPadding, desiredPixelPadding],
    ], chartHeight);
    const baselinePaddedDomainLo = orderedDomain[0] - desiredPixelPadding / scaleMultiplier;
    const baselinePaddedDomainHigh = orderedDomain[1] + desiredPixelPadding / scaleMultiplier;
    const crossBelow = constrainDomainPadding && baselinePaddedDomainLo < intercept && orderedDomain[0] >= intercept;
    const crossAbove = constrainDomainPadding && baselinePaddedDomainHigh > 0 && orderedDomain[1] <= 0;
    const paddedDomainLo = crossBelow
        ? intercept
        : crossAbove
            ? orderedDomain[0] -
                desiredPixelPadding /
                    (0, screenspace_marker_scale_compressor_1.screenspaceMarkerScaleCompressor)([orderedDomain[0], intercept], [
                        [desiredPixelPadding, desiredPixelPadding],
                        [0, 0],
                    ], chartHeight).scaleMultiplier
            : baselinePaddedDomainLo;
    const paddedDomainHigh = crossBelow
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