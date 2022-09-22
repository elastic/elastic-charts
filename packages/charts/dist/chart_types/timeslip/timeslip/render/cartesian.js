"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCartesian = void 0;
var raster_1 = require("./raster");
var renderCartesian = function (ctx, config, dataState, guiConfig, defaultMinorTickLabelFormat, emWidth, fadeOutPixelWidth, defaultLabelFormat, yTickNumberFormatter, rasterSelector, cartesianWidth, cartesianHeight, _a, yUnitScale, yUnitScaleClamped, niceTicks) {
    var domainFrom = _a.domainFrom, domainTo = _a.domainTo;
    ctx.textBaseline = 'top';
    ctx.fillStyle = config.defaultFontColor;
    ctx.font = config.cssFontShorthand;
    ctx.textAlign = 'left';
    var timeExtent = domainTo - domainFrom;
    var getPixelX = function (timePointSec) {
        var continuousOffset = timePointSec - domainFrom;
        var ratio = continuousOffset / timeExtent;
        return cartesianWidth * ratio;
    };
    var notTooDense = function (domainFrom, domainTo) {
        return function (_a) {
            var minimumPixelsPerSecond = _a.minimumPixelsPerSecond;
            var domainInSeconds = domainTo - domainFrom;
            var pixelsPerSecond = cartesianWidth / domainInSeconds;
            return pixelsPerSecond > minimumPixelsPerSecond;
        };
    };
    var layers = rasterSelector(notTooDense(domainFrom, domainTo));
    var loHi = layers.reduce((0, raster_1.renderRaster)({
        ctx: ctx,
        config: config,
        guiConfig: guiConfig,
        dataState: dataState,
        fadeOutPixelWidth: fadeOutPixelWidth,
        emWidth: emWidth,
        defaultMinorTickLabelFormat: defaultMinorTickLabelFormat,
        defaultLabelFormat: defaultLabelFormat,
        yTickNumberFormatter: yTickNumberFormatter,
        domainFrom: domainFrom,
        domainTo: domainTo,
        getPixelX: getPixelX,
        cartesianWidth: cartesianWidth,
        cartesianHeight: cartesianHeight,
        niceTicks: niceTicks,
        yUnitScale: yUnitScale,
        yUnitScaleClamped: yUnitScaleClamped,
        layers: layers,
    }), { lo: null, hi: null, unitBarMaxWidthPixelsSum: 0, unitBarMaxWidthPixelsCount: 0 });
    return {
        lo: loHi.lo,
        hi: loHi.hi,
        binUnit: layers[0].unit,
        binUnitCount: layers[0].unitMultiplier,
        unitBarMaxWidthPixels: loHi.unitBarMaxWidthPixelsSum / loHi.unitBarMaxWidthPixelsCount,
    };
};
exports.renderCartesian = renderCartesian;
//# sourceMappingURL=cartesian.js.map