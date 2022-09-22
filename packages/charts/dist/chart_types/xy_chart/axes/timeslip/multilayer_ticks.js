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
Object.defineProperty(exports, "__esModule", { value: true });
exports.multilayerAxisEntry = exports.notTooDense = void 0;
var rasters_1 = require("./rasters");
var MAX_TIME_TICK_COUNT = 50;
var WIDTH_FUDGE = 1.05;
var MAX_TIME_GRID_COUNT = 12;
var notTooDense = function (domainFrom, domainTo, binWidth, cartesianWidth, maxTickCount) {
    if (maxTickCount === void 0) { maxTickCount = MAX_TIME_TICK_COUNT; }
    return function (raster) {
        var domainInSeconds = domainTo - domainFrom;
        var pixelsPerSecond = cartesianWidth / domainInSeconds;
        return (pixelsPerSecond > raster.minimumPixelsPerSecond &&
            raster.approxWidthInMs * WIDTH_FUDGE >= binWidth &&
            (domainInSeconds * 1000) / maxTickCount <= raster.approxWidthInMs);
    };
};
exports.notTooDense = notTooDense;
function multilayerAxisEntry(xDomain, extendByOneBin, range, timeAxisLayerCount, scale, getMeasuredTicks) {
    var rasterSelector = (0, rasters_1.rasters)({ minimumTickPixelDistance: 24, locale: 'en-US' }, xDomain.timeZone);
    var domainValues = xDomain.domain;
    var domainFromS = Number(domainValues[0]) / 1000;
    var binWidth = xDomain.minInterval;
    var domainExtension = extendByOneBin ? binWidth : 0;
    var domainToS = ((Number(domainValues[domainValues.length - 1]) || NaN) + domainExtension) / 1000;
    var layers = rasterSelector((0, exports.notTooDense)(domainFromS, domainToS, binWidth, Math.abs(range[1] - range[0])));
    var layerIndex = -1;
    var fillLayerTimeslip = function (layer, detailedLayer, timeTicks, labelFormat, showGrid) {
        return {
            entry: getMeasuredTicks(scale, timeTicks, layer, detailedLayer, labelFormat, showGrid),
            fallbackAskedTickCount: NaN,
        };
    };
    return layers.reduce(function (combinedEntry, l, detailedLayerIndex) {
        if (l.labeled)
            layerIndex++;
        if (layerIndex >= timeAxisLayerCount)
            return combinedEntry;
        var binWidthS = binWidth / 1000;
        var entry = fillLayerTimeslip(layerIndex, detailedLayerIndex, __spreadArray([], __read(l.binStarts(domainFromS - binWidthS, domainToS + binWidthS)), false).filter(function (b) { return b.nextTimePointSec > domainFromS && b.timePointSec <= domainToS; })
            .map(function (b) { return 1000 * b.timePointSec; }), !l.labeled ? function () { return ''; } : layerIndex === timeAxisLayerCount - 1 ? l.detailedLabelFormat : l.minorTickLabelFormat, (0, exports.notTooDense)(domainFromS, domainToS, binWidth, Math.abs(range[1] - range[0]), MAX_TIME_GRID_COUNT)(l)).entry;
        var minLabelGap = 4;
        var lastTick = entry.ticks[entry.ticks.length - 1];
        if (lastTick && lastTick.position + entry.labelBox.maxLabelBboxWidth > range[1]) {
            lastTick.label = '';
        }
        return __assign(__assign(__assign({}, combinedEntry), entry), { ticks: (combinedEntry.ticks || []).concat(entry.ticks.filter(function (tick, i, a) {
                return i > 0 ||
                    !a[1] ||
                    a[1].domainClampedPosition - tick.domainClampedPosition >= entry.labelBox.maxLabelBboxWidth + minLabelGap;
            })) });
    }, {
        ticks: [],
        labelBox: {
            maxLabelBboxWidth: 0,
            maxLabelBboxHeight: 0,
            maxLabelTextWidth: 0,
            maxLabelTextHeight: 0,
            isHidden: true,
        },
        scale: scale,
    });
}
exports.multilayerAxisEntry = multilayerAxisEntry;
//# sourceMappingURL=multilayer_ticks.js.map