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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeYScales = exports.computeXScale = void 0;
var scales_1 = require("../../../scales");
var constants_1 = require("../../../scales/constants");
function getBandScaleRange(isInverse, isSingleValueHistogram, minRange, maxRange, bandwidth) {
    var rangeEndOffset = isSingleValueHistogram ? 0 : bandwidth;
    var start = isInverse ? minRange - rangeEndOffset : minRange;
    var end = isInverse ? maxRange : maxRange - rangeEndOffset;
    return { start: start, end: end };
}
function computeXScale(options) {
    var xDomain = options.xDomain, totalBarsInCluster = options.totalBarsInCluster, range = options.range, barsPadding = options.barsPadding, enableHistogramMode = options.enableHistogramMode, integersOnly = options.integersOnly;
    var type = xDomain.type, nice = xDomain.nice, minInterval = xDomain.minInterval, domain = xDomain.domain, isBandScale = xDomain.isBandScale, timeZone = xDomain.timeZone, logBase = xDomain.logBase, desiredTickCount = xDomain.desiredTickCount;
    var rangeDiff = Math.abs(range[1] - range[0]);
    var isInverse = range[1] < range[0];
    if (type === constants_1.ScaleType.Ordinal) {
        var dividend = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
        var bandwidth = rangeDiff / (domain.length * dividend);
        return new scales_1.ScaleBand(domain, range, bandwidth, barsPadding);
    }
    if (isBandScale) {
        var _a = __read(domain, 2), domainMin = _a[0], domainMax = _a[1];
        var isSingleValueHistogram = !!enableHistogramMode && domainMax - domainMin === 0;
        var adjustedDomain = [domainMin, isSingleValueHistogram ? domainMin + minInterval : domainMax];
        var intervalCount = (adjustedDomain[1] - adjustedDomain[0]) / minInterval;
        var intervalCountOffset = isSingleValueHistogram ? 0 : 1;
        var bandwidth = rangeDiff / (intervalCount + intervalCountOffset);
        var _b = getBandScaleRange(isInverse, isSingleValueHistogram, range[0], range[1], bandwidth), start = _b.start, end = _b.end;
        return new scales_1.ScaleContinuous({
            type: type,
            domain: adjustedDomain,
            range: [start, end],
            nice: nice,
        }, {
            bandwidth: totalBarsInCluster > 0 ? bandwidth / totalBarsInCluster : bandwidth,
            minInterval: minInterval,
            timeZone: timeZone,
            totalBarsInCluster: totalBarsInCluster,
            barsPadding: barsPadding,
            desiredTickCount: desiredTickCount,
            isSingleValueHistogram: isSingleValueHistogram,
            logBase: logBase,
        });
    }
    else {
        return new scales_1.ScaleContinuous({ type: type, domain: domain, range: range, nice: nice }, {
            bandwidth: 0,
            minInterval: minInterval,
            timeZone: timeZone,
            totalBarsInCluster: totalBarsInCluster,
            barsPadding: barsPadding,
            desiredTickCount: desiredTickCount,
            integersOnly: integersOnly,
            logBase: logBase,
        });
    }
}
exports.computeXScale = computeXScale;
function computeYScales(options) {
    var yDomains = options.yDomains, range = options.range, integersOnly = options.integersOnly;
    return yDomains.reduce(function (yScales, _a) {
        var type = _a.type, nice = _a.nice, desiredTickCount = _a.desiredTickCount, domain = _a.domain, groupId = _a.groupId, logBase = _a.logBase, logMinLimit = _a.logMinLimit, domainPixelPadding = _a.domainPixelPadding, constrainDomainPadding = _a.constrainDomainPadding;
        var yScale = new scales_1.ScaleContinuous({ type: type, domain: domain, range: range, nice: nice }, {
            desiredTickCount: desiredTickCount,
            integersOnly: integersOnly,
            logBase: logBase,
            logMinLimit: logMinLimit,
            domainPixelPadding: domainPixelPadding,
            constrainDomainPadding: constrainDomainPadding,
        });
        yScales.set(groupId, yScale);
        return yScales;
    }, new Map());
}
exports.computeYScales = computeYScales;
//# sourceMappingURL=scales.js.map