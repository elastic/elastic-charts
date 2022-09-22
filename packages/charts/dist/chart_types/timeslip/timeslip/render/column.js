"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderColumn = void 0;
var bar_1 = require("./glyphs/bar");
var boxplot_1 = require("./glyphs/boxplot");
var renderColumn = function (_a, _b, pixelX, maxWidth) {
    var ctx = _a.ctx, config = _a.config, guiConfig = _a.guiConfig, dataState = _a.dataState, emWidth = _a.emWidth, fadeOutPixelWidth = _a.fadeOutPixelWidth, getPixelX = _a.getPixelX, labelFormat = _a.labelFormat, minorLabelFormat = _a.minorLabelFormat, unitBarMaxWidthPixelsSum = _a.unitBarMaxWidthPixelsSum, unitBarMaxWidthPixelsCount = _a.unitBarMaxWidthPixelsCount, labeled = _a.labeled, textNestLevel = _a.textNestLevel, textNestLevelRowLimited = _a.textNestLevelRowLimited, cartesianWidth = _a.cartesianWidth, cartesianHeight = _a.cartesianHeight, i = _a.i, valid = _a.valid, luma = _a.luma, lineThickness = _a.lineThickness, lineNestLevelRowLimited = _a.lineNestLevelRowLimited, halfLineThickness = _a.halfLineThickness, domainFrom = _a.domainFrom, layers = _a.layers, rows = _a.rows, yUnitScale = _a.yUnitScale, yUnitScaleClamped = _a.yUnitScaleClamped;
    var fontColor = _b.fontColor, timePointSec = _b.timePointSec, nextTimePointSec = _b.nextTimePointSec;
    if (pixelX === void 0) { pixelX = getPixelX(timePointSec); }
    if (maxWidth === void 0) { maxWidth = Infinity; }
    if (labeled && textNestLevel <= guiConfig.maxLabelRowCount) {
        var text = textNestLevelRowLimited === guiConfig.maxLabelRowCount
            ? labelFormat(timePointSec * 1000)
            : minorLabelFormat(timePointSec * 1000);
        if (text.length > 0) {
            var textX = pixelX + config.horizontalPixelOffset;
            var y = config.verticalPixelOffset + (textNestLevelRowLimited - 1) * config.rowPixelPitch;
            var leftShortening = maxWidth === Infinity ? 0 : Math.max(0, ctx.measureText(text).width + config.horizontalPixelOffset - maxWidth);
            var rightShortening = textX + Math.min(maxWidth, text.length * emWidth) < cartesianWidth
                ? 0
                : Math.max(0, textX + ctx.measureText(text).width - cartesianWidth);
            var maxWidthRight = Math.max(0, cartesianWidth - textX);
            var clipLeft = config.clipLeft && leftShortening > 0;
            var clipRight = config.clipRight && rightShortening > 0;
            if (clipLeft) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(config.horizontalPixelOffset, y - 0.35 * config.rowPixelPitch, maxWidth, config.rowPixelPitch);
                ctx.clip();
            }
            if (clipRight) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(textX, y - 0.35 * config.rowPixelPitch, maxWidthRight, config.rowPixelPitch);
                ctx.clip();
            }
            ctx.fillStyle =
                fontColor !== null && fontColor !== void 0 ? fontColor : (guiConfig.a11y.contrast === 'low' ? config.subduedFontColor : config.defaultFontColor);
            ctx.fillText(text, textX - leftShortening, y);
            if (clipRight) {
                var _c = config.backgroundColor, r = _c.r, g = _c.g, b = _c.b;
                var fadeOutRight = ctx.createLinearGradient(textX, 0, textX + maxWidthRight, 0);
                fadeOutRight.addColorStop(0, "rgba(".concat(r, ",").concat(g, ",").concat(b, ",0)"));
                fadeOutRight.addColorStop(maxWidthRight === 0 ? 0.5 : Math.max(0, 1 - fadeOutPixelWidth / maxWidthRight), "rgba(".concat(r, ",").concat(g, ",").concat(b, ",0)"));
                fadeOutRight.addColorStop(1, "rgba(".concat(r, ",").concat(g, ",").concat(b, ",1)"));
                ctx.fillStyle = fadeOutRight;
                ctx.fill();
                ctx.restore();
            }
            if (clipLeft) {
                var _d = config.backgroundColor, r = _d.r, g = _d.g, b = _d.b;
                var fadeOutLeft = ctx.createLinearGradient(0, 0, maxWidth, 0);
                fadeOutLeft.addColorStop(0, "rgba(".concat(r, ",").concat(g, ",").concat(b, ",1)"));
                fadeOutLeft.addColorStop(maxWidth === 0 ? 0.5 : Math.min(1, fadeOutPixelWidth / maxWidth), "rgba(".concat(r, ",").concat(g, ",").concat(b, ",0)"));
                fadeOutLeft.addColorStop(1, "rgba(".concat(r, ",").concat(g, ",").concat(b, ",0)"));
                ctx.fillStyle = fadeOutLeft;
                ctx.fill();
                ctx.restore();
            }
        }
    }
    var barPad = guiConfig.implicit ? halfLineThickness : 0;
    var fullBarPixelX = getPixelX(timePointSec);
    var barMaxWidthPixels = getPixelX(nextTimePointSec) - fullBarPixelX - 2 * barPad;
    if (i === 0) {
        unitBarMaxWidthPixelsSum += barMaxWidthPixels;
        unitBarMaxWidthPixelsCount++;
    }
    renderBar: if (i === 0 &&
        valid &&
        dataState.binUnit === layers[0].unit &&
        dataState.binUnitCount === layers[0].unitMultiplier) {
        var foundRow = rows.find(function (r) { return timePointSec * 1000 <= r.epochMs && r.epochMs < nextTimePointSec * 1000; });
        if (!foundRow) {
            break renderBar;
        }
        ctx.save();
        var leftShortfall = Math.abs(pixelX - fullBarPixelX);
        var leftOpacityMultiplier = leftShortfall ? 1 - Math.max(0, Math.min(1, leftShortfall / barMaxWidthPixels)) : 1;
        var barX = pixelX + barPad;
        var rightShortfall = Math.max(0, barX + barMaxWidthPixels - cartesianWidth);
        var maxBarHeight = cartesianHeight;
        var barWidthPixels = barMaxWidthPixels - rightShortfall;
        var rightOpacityMultiplier = rightShortfall
            ? 1 - Math.max(0, Math.min(1, rightShortfall / barMaxWidthPixels))
            : 1;
        var _e = config.barChroma, r = _e.r, g = _e.g, b = _e.b;
        var maxOpacity = config.barFillAlpha;
        var opacityMultiplier = leftOpacityMultiplier * rightOpacityMultiplier;
        var opacity = maxOpacity * opacityMultiplier;
        var opacityDependentLineThickness = opacityMultiplier === 1 ? 1 : Math.sqrt(opacityMultiplier);
        if (guiConfig.queryConfig.boxplot && foundRow.boxplot) {
            (0, boxplot_1.renderBoxplotGlyph)(ctx, barMaxWidthPixels, barX, leftShortfall, foundRow, maxBarHeight, yUnitScaleClamped, opacityMultiplier, r, g, b, maxOpacity);
        }
        else {
            (0, bar_1.renderBarGlyph)(ctx, barWidthPixels, leftShortfall, maxBarHeight, yUnitScale, foundRow, yUnitScaleClamped, r, g, b, opacity, barX, opacityDependentLineThickness);
        }
        ctx.restore();
    }
    if (domainFrom < timePointSec) {
        ctx.fillStyle = "rgb(".concat(luma, ",").concat(luma, ",").concat(luma, ")");
        ctx.fillRect(pixelX - halfLineThickness, -cartesianHeight, lineThickness, cartesianHeight + lineNestLevelRowLimited * config.rowPixelPitch);
        if (guiConfig.implicit && lineNestLevelRowLimited > 0) {
            var verticalSeparation = 1;
            ctx.fillStyle = 'lightgrey';
            ctx.fillRect(pixelX - halfLineThickness, verticalSeparation, lineThickness, lineNestLevelRowLimited * config.rowPixelPitch - verticalSeparation);
        }
    }
    return {
        unitBarMaxWidthPixelsSum: unitBarMaxWidthPixelsSum,
        unitBarMaxWidthPixelsCount: unitBarMaxWidthPixelsCount,
    };
};
exports.renderColumn = renderColumn;
//# sourceMappingURL=column.js.map