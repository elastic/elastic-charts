"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCartesian = void 0;
const raster_1 = require("./raster");
const multilayer_ticks_1 = require("../../../xy_chart/axes/timeslip/multilayer_ticks");
const scale_1 = require("../../projections/scale");
const renderCartesian = (ctx, config, dataState, defaultMinorTickLabelFormat, emWidth, fadeOutPixelWidth, defaultLabelFormat, yTickNumberFormatter, rasterSelector, cartesianWidth, cartesianHeight, { domainFrom, domainTo }, yUnitScale, niceTicks) => {
    var _a, _b;
    ctx.textBaseline = 'top';
    ctx.fillStyle = config.defaultFontColor;
    ctx.font = config.cssFontShorthand;
    ctx.textAlign = 'left';
    const getPixelX = (0, scale_1.makeLinearScale)(domainFrom, domainTo, 0, cartesianWidth);
    const layers = rasterSelector((0, multilayer_ticks_1.notTooDense)(domainFrom, domainTo, 0, cartesianWidth, multilayer_ticks_1.MAX_TIME_TICK_COUNT));
    const loHi = layers.reduce((0, raster_1.renderRaster)(ctx, config, dataState, fadeOutPixelWidth, emWidth, defaultMinorTickLabelFormat, defaultLabelFormat, yTickNumberFormatter, domainFrom, domainTo, getPixelX, cartesianWidth, cartesianHeight, niceTicks, yUnitScale, layers), { lo: null, hi: null, unitBarMaxWidthPixelsSum: 0, unitBarMaxWidthPixelsCount: 0 });
    const finestLayer = layers[0];
    return {
        lo: loHi.lo,
        hi: loHi.hi,
        binUnit: (_a = finestLayer === null || finestLayer === void 0 ? void 0 : finestLayer.unit) !== null && _a !== void 0 ? _a : 'millisecond',
        binUnitCount: (_b = finestLayer === null || finestLayer === void 0 ? void 0 : finestLayer.unitMultiplier) !== null && _b !== void 0 ? _b : 1,
        unitBarMaxWidthPixels: loHi.unitBarMaxWidthPixelsSum / loHi.unitBarMaxWidthPixelsCount,
    };
};
exports.renderCartesian = renderCartesian;
//# sourceMappingURL=cartesian.js.map