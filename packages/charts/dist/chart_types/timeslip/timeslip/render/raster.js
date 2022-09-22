"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRaster = void 0;
var math_1 = require("../utils/math");
var column_1 = require("./column");
var renderRaster = function (_a) {
    var ctx = _a.ctx, config = _a.config, guiConfig = _a.guiConfig, dataState = _a.dataState, fadeOutPixelWidth = _a.fadeOutPixelWidth, emWidth = _a.emWidth, defaultMinorTickLabelFormat = _a.defaultMinorTickLabelFormat, defaultLabelFormat = _a.defaultLabelFormat, yTickNumberFormatter = _a.yTickNumberFormatter, domainFrom = _a.domainFrom, domainTo = _a.domainTo, getPixelX = _a.getPixelX, cartesianWidth = _a.cartesianWidth, cartesianHeight = _a.cartesianHeight, niceTicks = _a.niceTicks, yUnitScale = _a.yUnitScale, yUnitScaleClamped = _a.yUnitScaleClamped, layers = _a.layers;
    return function (loHi, _a, i, a) {
        var e_1, _b, e_2, _c;
        var _d;
        var labeled = _a.labeled, binStarts = _a.binStarts, minorTickLabelFormat = _a.minorTickLabelFormat, detailedLabelFormat = _a.detailedLabelFormat;
        var valid = dataState.valid, rows = dataState.dataResponse.rows;
        var minorLabelFormat = minorTickLabelFormat !== null && minorTickLabelFormat !== void 0 ? minorTickLabelFormat : defaultMinorTickLabelFormat;
        var labelFormat = (_d = detailedLabelFormat !== null && detailedLabelFormat !== void 0 ? detailedLabelFormat : minorLabelFormat) !== null && _d !== void 0 ? _d : defaultLabelFormat;
        var textNestLevel = a.slice(0, i + 1).filter(function (layer) { return layer.labeled; }).length;
        var lineNestLevel = a[i] === a[0] ? 0 : textNestLevel;
        var textNestLevelRowLimited = Math.min(guiConfig.maxLabelRowCount, textNestLevel);
        var lineNestLevelRowLimited = Math.min(guiConfig.maxLabelRowCount, lineNestLevel);
        var lineThickness = config.lineThicknessSteps[i];
        var luma = config.lumaSteps[i] *
            (guiConfig.darkMode
                ? guiConfig.a11y.contrast === 'low'
                    ? 0.5
                    : 1
                : guiConfig.a11y.contrast === 'low'
                    ? 1.5
                    : 1);
        var halfLineThickness = lineThickness / 2;
        var firstInsideBinStart;
        var precedingBinStart;
        var columnProps = {
            ctx: ctx,
            config: config,
            guiConfig: guiConfig,
            dataState: dataState,
            fadeOutPixelWidth: fadeOutPixelWidth,
            emWidth: emWidth,
            getPixelX: getPixelX,
            labelFormat: labelFormat,
            minorLabelFormat: minorLabelFormat,
            unitBarMaxWidthPixelsSum: loHi.unitBarMaxWidthPixelsSum,
            unitBarMaxWidthPixelsCount: loHi.unitBarMaxWidthPixelsCount,
            labeled: labeled,
            textNestLevel: textNestLevel,
            textNestLevelRowLimited: textNestLevelRowLimited,
            cartesianWidth: cartesianWidth,
            cartesianHeight: cartesianHeight,
            i: i,
            valid: valid,
            luma: luma,
            lineThickness: lineThickness,
            halfLineThickness: halfLineThickness,
            lineNestLevelRowLimited: lineNestLevelRowLimited,
            domainFrom: domainFrom,
            layers: layers,
            rows: rows,
            yUnitScale: yUnitScale,
            yUnitScaleClamped: yUnitScaleClamped,
        };
        try {
            for (var _e = __values(binStarts(domainFrom, domainTo)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var binStart = _f.value;
                var timePointSec = binStart.timePointSec;
                if (domainFrom > timePointSec) {
                    precedingBinStart = binStart;
                    continue;
                }
                if (timePointSec > domainTo) {
                    break;
                }
                if (i === 0) {
                    loHi.lo = loHi.lo || binStart;
                    loHi.hi = binStart;
                }
                if (!firstInsideBinStart) {
                    firstInsideBinStart = binStart;
                }
                var _g = (0, column_1.renderColumn)(columnProps, binStart), unitBarMaxWidthPixelsSum = _g.unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount = _g.unitBarMaxWidthPixelsCount;
                loHi.unitBarMaxWidthPixelsSum = unitBarMaxWidthPixelsSum;
                loHi.unitBarMaxWidthPixelsCount = unitBarMaxWidthPixelsCount;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (precedingBinStart) {
            if (i === 0) {
                loHi.lo = precedingBinStart;
            }
            var _h = (0, column_1.renderColumn)(columnProps, precedingBinStart, 0, firstInsideBinStart
                ? Math.max(0, getPixelX(firstInsideBinStart.timePointSec) - config.horizontalPixelOffset)
                : Infinity), unitBarMaxWidthPixelsSum = _h.unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount = _h.unitBarMaxWidthPixelsCount;
            loHi.unitBarMaxWidthPixelsSum = unitBarMaxWidthPixelsSum;
            loHi.unitBarMaxWidthPixelsCount = unitBarMaxWidthPixelsCount;
        }
        var horizontalGrids = true;
        if (horizontalGrids) {
            ctx.save();
            var _j = config.backgroundColor, r = _j.r, g = _j.g, b = _j.b;
            var lineStyle = guiConfig.implicit
                ? "rgb(".concat(r, ",").concat(g, ",").concat(b, ")")
                : "rgba(128,128,128,".concat(guiConfig.a11y.contrast === 'low' ? 0.5 : 1, ")");
            ctx.textBaseline = 'middle';
            ctx.font = config.cssFontShorthand;
            var overhang = 8;
            var gap = 8;
            try {
                for (var niceTicks_1 = __values(niceTicks), niceTicks_1_1 = niceTicks_1.next(); !niceTicks_1_1.done; niceTicks_1_1 = niceTicks_1.next()) {
                    var gridDomainValueY = niceTicks_1_1.value;
                    var yUnit = yUnitScale(gridDomainValueY);
                    if (yUnit !== (0, math_1.clamp)(yUnit, -0.01, 1.01)) {
                        continue;
                    }
                    var y = -cartesianHeight * yUnit;
                    var text = yTickNumberFormatter.format(gridDomainValueY);
                    ctx.fillStyle = gridDomainValueY === 0 ? config.defaultFontColor : lineStyle;
                    ctx.fillRect(-overhang, y, cartesianWidth + 2 * overhang, gridDomainValueY === 0 ? 0.5 : guiConfig.implicit ? 0.2 : 0.1);
                    ctx.fillStyle = config.subduedFontColor;
                    ctx.textAlign = 'left';
                    ctx.fillText(text, cartesianWidth + overhang + gap, y);
                    ctx.textAlign = 'right';
                    ctx.fillText(text, -overhang - gap, y);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (niceTicks_1_1 && !niceTicks_1_1.done && (_c = niceTicks_1.return)) _c.call(niceTicks_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            ctx.restore();
        }
        return loHi;
    };
};
exports.renderRaster = renderRaster;
//# sourceMappingURL=raster.js.map