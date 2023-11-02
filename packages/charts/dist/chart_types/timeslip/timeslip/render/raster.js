"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRaster = exports.calcColumnBar = void 0;
const column_1 = require("./column");
const iterables_1 = require("../../../../common/iterables");
const common_1 = require("../../../../utils/common");
const multilayer_ticks_1 = require("../../../xy_chart/axes/timeslip/multilayer_ticks");
const math_1 = require("../../utils/math");
const TIMESLIP_MAX_TIME_GRID_COUNT = 100 || multilayer_ticks_1.MAX_TIME_GRID_COUNT;
const renderHorizontalGridLines = (ctx, config, niceTicks, yUnitScale, cartesianHeight, yTickNumberFormatter, cartesianWidth) => {
    ctx.save();
    const { r, g, b } = config.backgroundColor;
    const lineStyle = config.implicit
        ? `rgb(${r},${g},${b})`
        : `rgba(128,128,128,${config.a11y.contrast === 'low' ? 0.5 : 1})`;
    ctx.textBaseline = 'middle';
    ctx.font = config.cssFontShorthand;
    for (const gridDomainValueY of niceTicks) {
        const yUnit = yUnitScale(gridDomainValueY);
        if (yUnit !== (0, math_1.clamp)(yUnit, -0.01, 1.01)) {
            continue;
        }
        const y = -cartesianHeight * yUnit;
        const text = yTickNumberFormatter(gridDomainValueY);
        ctx.fillStyle = gridDomainValueY === 0 ? config.defaultFontColor : lineStyle;
        ctx.fillRect(-config.yTickOverhang, y, cartesianWidth + 2 * config.yTickOverhang, gridDomainValueY === 0 ? 0.5 : config.implicit ? 0.2 : 0.1);
        ctx.fillStyle = config.subduedFontColor;
        ctx.textAlign = 'left';
        ctx.fillText(text, cartesianWidth + config.yTickOverhang + config.yTickGap, y);
        ctx.textAlign = 'right';
        ctx.fillText(text, -config.yTickOverhang - config.yTickGap, y);
    }
    ctx.restore();
};
const binsToRender = (binStarts, domainFrom, domainTo) => {
    const binStartList = [];
    for (const binStart of binStarts) {
        if (binStart.minimum > domainTo)
            break;
        if (binStart.minimum < domainFrom) {
            binStartList[0] = binStart;
        }
        else {
            binStartList.push(binStart);
        }
    }
    return binStartList;
};
const calcColumnBar = (getPixelX, unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount, i, halfLineThickness, implicit, { minimum, supremum }) => {
    if (i !== 0)
        return { unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount };
    const barPad = implicit ? halfLineThickness : 0;
    const fullBarPixelX = getPixelX(minimum);
    const barMaxWidthPixels = getPixelX(supremum) - fullBarPixelX - 2 * barPad;
    return {
        unitBarMaxWidthPixelsSum: unitBarMaxWidthPixelsSum + barMaxWidthPixels,
        unitBarMaxWidthPixelsCount: unitBarMaxWidthPixelsCount + 1,
    };
};
exports.calcColumnBar = calcColumnBar;
const updateLoHi = (binStarts, implicit, halfLineThickness, getPixelX, loHi, i) => {
    for (const binStart of binStarts) {
        if (i === 0) {
            loHi.lo = loHi.lo || binStart;
            loHi.hi = binStart;
        }
        const { unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount } = (0, exports.calcColumnBar)(getPixelX, loHi.unitBarMaxWidthPixelsSum, loHi.unitBarMaxWidthPixelsCount, i, halfLineThickness, implicit, binStart);
        loHi.unitBarMaxWidthPixelsSum = unitBarMaxWidthPixelsSum;
        loHi.unitBarMaxWidthPixelsCount = unitBarMaxWidthPixelsCount;
    }
};
const renderRaster = (ctx, config, dataState, fadeOutPixelWidth, emWidth, defaultMinorTickLabelFormat, defaultLabelFormat, yTickNumberFormatter, domainFrom, domainTo, getPixelX, cartesianWidth, cartesianHeight, niceTicks, yUnitScale, layers) => (loHi, { labeled, intervals, minorTickLabelFormat, detailedLabelFormat, minimumTickPixelDistance, unit, unitMultiplier, }, i, a) => {
    var _a, _b, _c, _d;
    const { valid, dataResponse: { rows }, } = dataState;
    const minorLabelFormat = minorTickLabelFormat !== null && minorTickLabelFormat !== void 0 ? minorTickLabelFormat : defaultMinorTickLabelFormat;
    const labelFormat = (_a = detailedLabelFormat !== null && detailedLabelFormat !== void 0 ? detailedLabelFormat : minorLabelFormat) !== null && _a !== void 0 ? _a : defaultLabelFormat;
    const textNestLevel = a.slice(0, i + 1).filter((layer) => layer.labeled).length;
    const lineNestLevel = a[i] === a[0] ? 0 : textNestLevel;
    const textNestLevelRowLimited = Math.min(config.maxLabelRowCount, textNestLevel);
    const lineNestLevelRowLimited = Math.min(config.maxLabelRowCount, lineNestLevel);
    const lineThickness = (_b = config.lineThicknessSteps[i]) !== null && _b !== void 0 ? _b : NaN;
    const luma = ((_c = config.lumaSteps[i]) !== null && _c !== void 0 ? _c : NaN) *
        (config.darkMode ? (config.a11y.contrast === 'low' ? 0.5 : 1) : config.a11y.contrast === 'low' ? 1.5 : 1);
    const halfLineThickness = lineThickness / 2;
    const notTooDenseGridLayer = (0, multilayer_ticks_1.notTooDense)(domainFrom, domainTo, 0, cartesianWidth, TIMESLIP_MAX_TIME_GRID_COUNT);
    const binStartList = binsToRender(intervals(domainFrom, domainTo), domainFrom, domainTo);
    updateLoHi(binStartList, config.implicit, halfLineThickness, getPixelX, loHi, i);
    const finestRaster = i === 0;
    const renderBar = finestRaster &&
        valid &&
        dataState.binUnit === ((_d = layers[0]) === null || _d === void 0 ? void 0 : _d.unit) &&
        dataState.binUnitCount === layers[0].unitMultiplier;
    if (labeled && textNestLevel <= config.maxLabelRowCount)
        (0, column_1.renderColumnTickLabels)(ctx, config, fadeOutPixelWidth, emWidth, getPixelX, labelFormat, minorLabelFormat, textNestLevelRowLimited, cartesianWidth, binStartList);
    if (renderBar)
        (0, column_1.renderColumnBars)(ctx, getPixelX, cartesianWidth, cartesianHeight, config.implicit ? halfLineThickness : 0, rows, yUnitScale, config.barChroma, config.barFillAlpha, binStartList);
    if (notTooDenseGridLayer({ minimumTickPixelDistance, unit, unitMultiplier })) {
        const { rowPixelPitch } = config;
        ctx.fillStyle = `rgb(${luma},${luma},${luma})`;
        const lastBinForClosingGridline = binStartList.slice(-1).map((bin) => ({ ...bin, binStart: bin.supremum }));
        (0, iterables_1.pipeline)([...binStartList, ...lastBinForClosingGridline], (0, iterables_1.mapping)(({ minimum }) => minimum), (0, iterables_1.filtering)((binStart) => binStart >= domainFrom), (0, iterables_1.mapping)(getPixelX), (0, iterables_1.doing)((pixelX) => {
            const left = pixelX - 0.5 * lineThickness;
            const height = cartesianHeight + lineNestLevelRowLimited * rowPixelPitch;
            ctx.fillRect(left, -cartesianHeight, lineThickness, height);
        }), iterables_1.executing);
    }
    if (!(0, common_1.isNil)(binStartList[0]) && binStartList[0].minimum < domainFrom) {
        const precedingBinStart = binStartList[0];
        if (finestRaster) {
            loHi.lo = precedingBinStart;
        }
        const { unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount } = (0, exports.calcColumnBar)(getPixelX, loHi.unitBarMaxWidthPixelsSum, loHi.unitBarMaxWidthPixelsCount, i, halfLineThickness, config.implicit, precedingBinStart);
        loHi.unitBarMaxWidthPixelsSum = unitBarMaxWidthPixelsSum;
        loHi.unitBarMaxWidthPixelsCount = unitBarMaxWidthPixelsCount;
    }
    renderHorizontalGridLines(ctx, config, niceTicks, yUnitScale, cartesianHeight, yTickNumberFormatter, cartesianWidth);
    return loHi;
};
exports.renderRaster = renderRaster;
//# sourceMappingURL=raster.js.map