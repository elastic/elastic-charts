"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeYScales = exports.computeXScale = void 0;
const scales_1 = require("../../../scales");
const constants_1 = require("../../../scales/constants");
function getBandScaleRange(isInverse, isSingleValueHistogram, minRange, maxRange, bandwidth) {
    const rangeEndOffset = isSingleValueHistogram ? 0 : bandwidth;
    const start = isInverse ? minRange - rangeEndOffset : minRange;
    const end = isInverse ? maxRange : maxRange - rangeEndOffset;
    return { start, end };
}
function computeXScale(options) {
    const { xDomain, totalBarsInCluster, range, barsPadding, enableHistogramMode, integersOnly } = options;
    const { type, nice, minInterval, domain, isBandScale, timeZone, logBase, desiredTickCount } = xDomain;
    const rangeDiff = Math.abs(range[1] - range[0]);
    const isInverse = range[1] < range[0];
    if (type === constants_1.ScaleType.Ordinal) {
        const dividend = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
        const bandwidth = rangeDiff / (domain.length * dividend);
        return new scales_1.ScaleBand(domain, range, bandwidth, barsPadding);
    }
    if (isBandScale) {
        const [domainMin, domainMax] = domain;
        const isSingleValueHistogram = !!enableHistogramMode && domainMax - domainMin === 0;
        const adjustedDomain = [domainMin, isSingleValueHistogram ? domainMin + minInterval : domainMax];
        const intervalCount = (adjustedDomain[1] - adjustedDomain[0]) / minInterval;
        const intervalCountOffset = isSingleValueHistogram ? 0 : 1;
        const bandwidth = rangeDiff / (intervalCount + intervalCountOffset);
        const { start, end } = getBandScaleRange(isInverse, isSingleValueHistogram, range[0], range[1], bandwidth);
        return new scales_1.ScaleContinuous({
            type,
            domain: adjustedDomain,
            range: [start, end],
            nice,
        }, {
            bandwidth: totalBarsInCluster > 0 ? bandwidth / totalBarsInCluster : bandwidth,
            minInterval,
            timeZone,
            totalBarsInCluster,
            barsPadding,
            desiredTickCount,
            isSingleValueHistogram,
            logBase,
        });
    }
    else {
        return new scales_1.ScaleContinuous({ type, domain: domain, range, nice }, {
            bandwidth: 0,
            minInterval,
            timeZone,
            totalBarsInCluster,
            barsPadding,
            desiredTickCount,
            integersOnly,
            logBase,
        });
    }
}
exports.computeXScale = computeXScale;
function computeYScales(options) {
    const { yDomains, range, integersOnly } = options;
    return yDomains.reduce((yScales, { type, nice, desiredTickCount, domain, groupId, logBase, logMinLimit, domainPixelPadding, constrainDomainPadding, }) => {
        const yScale = new scales_1.ScaleContinuous({ type, domain, range, nice }, {
            desiredTickCount,
            integersOnly,
            logBase,
            logMinLimit,
            domainPixelPadding,
            constrainDomainPadding,
        });
        yScales.set(groupId, yScale);
        return yScales;
    }, new Map());
}
exports.computeYScales = computeYScales;
//# sourceMappingURL=scales.js.map