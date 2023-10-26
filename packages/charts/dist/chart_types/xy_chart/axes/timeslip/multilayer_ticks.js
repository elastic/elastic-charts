"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multilayerAxisEntry = exports.notTooDense = exports.MINIMUM_TICK_PIXEL_DISTANCE = exports.MAX_TIME_GRID_COUNT = exports.MAX_TIME_TICK_COUNT = void 0;
const continuous_time_rasters_1 = require("./continuous_time_rasters");
const WIDTH_FUDGE = 1.05;
exports.MAX_TIME_TICK_COUNT = 50;
exports.MAX_TIME_GRID_COUNT = 12;
exports.MINIMUM_TICK_PIXEL_DISTANCE = 24;
const notTooDense = (domainFrom, domainTo, intervalWidth, cartesianWidth, maxTickCount) => ({ unit, unitMultiplier, minimumTickPixelDistance, }) => {
    const domainSize = domainTo - domainFrom;
    const partitionIntervalWidth = continuous_time_rasters_1.unitIntervalWidth[unit] * unitMultiplier;
    const maximumTickCount = Math.min(maxTickCount, cartesianWidth / minimumTickPixelDistance);
    const tickCountConstraint = domainSize / maximumTickCount;
    const spacingConstraint = intervalWidth / WIDTH_FUDGE;
    return partitionIntervalWidth >= Math.max(tickCountConstraint, spacingConstraint);
};
exports.notTooDense = notTooDense;
function multilayerAxisEntry(xDomain, extendByOneBin, range, timeAxisLayerCount, scale, getMeasuredTicks, locale) {
    const rasterSelector = (0, continuous_time_rasters_1.continuousTimeRasters)({ minimumTickPixelDistance: exports.MINIMUM_TICK_PIXEL_DISTANCE, locale }, xDomain.timeZone);
    const domainValues = xDomain.domain;
    const domainFromS = Number(domainValues[0]) / 1000;
    const binWidthMs = xDomain.minInterval;
    const binWidth = binWidthMs / 1000;
    const domainExtension = extendByOneBin ? binWidthMs : 0;
    const domainToS = ((Number(domainValues.at(-1)) || NaN) + domainExtension) / 1000;
    const cartesianWidth = Math.abs(range[1] - range[0]);
    const layers = rasterSelector((0, exports.notTooDense)(domainFromS, domainToS, binWidth, cartesianWidth, exports.MAX_TIME_TICK_COUNT));
    let layerIndex = -1;
    const fillLayerTimeslip = (layer, detailedLayer, timeTicks, labelFormat, showGrid) => {
        return {
            entry: getMeasuredTicks(scale, timeTicks, layer, detailedLayer, labelFormat, showGrid),
            fallbackAskedTickCount: NaN,
        };
    };
    const binStartsFrom = domainFromS - binWidth;
    const binStartsTo = domainToS + binWidth;
    return layers.reduce((combinedEntry, l, detailedLayerIndex) => {
        if (l.labeled)
            layerIndex++;
        if (layerIndex >= timeAxisLayerCount)
            return combinedEntry;
        const timeTicks = [...l.intervals(binStartsFrom, binStartsTo)]
            .filter((b) => {
            if (b.labelSupremum !== b.supremum && b.minimum < domainFromS)
                return false;
            return b.supremum > domainFromS && b.minimum <= domainToS;
        })
            .map((b) => 1000 * b.minimum);
        if (timeTicks.length === 0) {
            return combinedEntry;
        }
        const { entry } = fillLayerTimeslip(layerIndex, detailedLayerIndex, timeTicks, !l.labeled ? () => '' : layerIndex === timeAxisLayerCount - 1 ? l.detailedLabelFormat : l.minorTickLabelFormat, (0, exports.notTooDense)(domainFromS, domainToS, binWidth, cartesianWidth, exports.MAX_TIME_GRID_COUNT)(l));
        const minLabelGap = 4;
        const lastTick = entry.ticks.at(-1);
        if (lastTick && lastTick.position + entry.labelBox.maxLabelBboxWidth > range[1]) {
            lastTick.label = '';
        }
        return {
            ...combinedEntry,
            ...entry,
            ticks: (combinedEntry.ticks || []).concat(entry.ticks.filter((tick, i, a) => i > 0 ||
                !a[1] ||
                a[1].domainClampedPosition - tick.domainClampedPosition >= entry.labelBox.maxLabelBboxWidth + minLabelGap)),
        };
    }, {
        ticks: [],
        labelBox: {
            maxLabelBboxWidth: 0,
            maxLabelBboxHeight: 0,
            maxLabelTextWidth: 0,
            maxLabelTextHeight: 0,
            isHidden: true,
        },
        scale,
    });
}
exports.multilayerAxisEntry = multilayerAxisEntry;
//# sourceMappingURL=multilayer_ticks.js.map