"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderColumnBars = exports.renderColumnTickLabels = void 0;
const bar_1 = require("./glyphs/bar");
const boxplot_1 = require("./glyphs/boxplot");
const textOffset = 0.35;
const showMissingValuesAsZero = false;
const renderColumnTickLabels = (ctx, config, fadeOutPixelWidth, emWidth, getPixelX, labelFormat, minorLabelFormat, textNestLevelRowLimited, cartesianWidth, binStartList) => {
    for (const { minimum, supremum } of binStartList) {
        const text = textNestLevelRowLimited === config.maxLabelRowCount
            ? labelFormat(minimum * 1000)
            : minorLabelFormat(minimum * 1000);
        if (text.length <= 0)
            continue;
        const pixelX = Math.max(0, getPixelX(minimum));
        const textX = pixelX + config.horizontalPixelOffset;
        const y = config.verticalPixelOffset + (textNestLevelRowLimited - 1) * config.rowPixelPitch;
        const maxWidth = getPixelX(supremum) - config.horizontalPixelOffset;
        const leftShortening = maxWidth >= cartesianWidth
            ? 0
            : Math.max(0, ctx.measureText(text).width + config.horizontalPixelOffset - maxWidth);
        const rightShortening = textX + Math.min(maxWidth, text.length * emWidth) < cartesianWidth
            ? 0
            : Math.max(0, textX + ctx.measureText(text).width - cartesianWidth);
        const maxWidthRight = Math.max(0, cartesianWidth - textX);
        const clipLeft = config.clipLeft && leftShortening > 0;
        const clipRight = config.clipRight && rightShortening > 0;
        if (clipLeft) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(config.horizontalPixelOffset, y - textOffset * config.rowPixelPitch, maxWidth, config.rowPixelPitch);
            ctx.clip();
        }
        if (clipRight) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(textX, y - textOffset * config.rowPixelPitch, maxWidthRight, config.rowPixelPitch);
            ctx.clip();
        }
        ctx.fillStyle = config.a11y.contrast === 'low' ? config.subduedFontColor : config.defaultFontColor;
        ctx.fillText(text, textX - leftShortening, y);
        if (clipRight) {
            const { r, g, b } = config.backgroundColor;
            const fadeOutRight = ctx.createLinearGradient(textX, 0, textX + maxWidthRight, 0);
            fadeOutRight.addColorStop(0, `rgba(${r},${g},${b},0)`);
            fadeOutRight.addColorStop(maxWidthRight <= 0 ? 0.5 : Math.max(0, 1 - fadeOutPixelWidth / maxWidthRight), `rgba(${r},${g},${b},0)`);
            fadeOutRight.addColorStop(1, `rgba(${r},${g},${b},1)`);
            ctx.fillStyle = fadeOutRight;
            ctx.fill();
            ctx.restore();
        }
        if (clipLeft) {
            const { r, g, b } = config.backgroundColor;
            const fadeOutLeft = ctx.createLinearGradient(0, 0, maxWidth, 0);
            fadeOutLeft.addColorStop(0, `rgba(${r},${g},${b},1)`);
            fadeOutLeft.addColorStop(maxWidth <= 0 ? 0.5 : Math.min(1, fadeOutPixelWidth / maxWidth), `rgba(${r},${g},${b},0)`);
            fadeOutLeft.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.fillStyle = fadeOutLeft;
            ctx.fill();
            ctx.restore();
        }
    }
};
exports.renderColumnTickLabels = renderColumnTickLabels;
const renderColumnBars = (ctx, getPixelX, cartesianWidth, cartesianHeight, barPad, rows, yUnitScale, barChroma, barFillAlpha, timeBins) => {
    for (const { minimum, supremum } of timeBins) {
        const foundRow = rows.find((r) => minimum * 1000 <= r.epochMs && r.epochMs < supremum * 1000);
        if (!foundRow && !showMissingValuesAsZero)
            continue;
        const fullBarPixelX = getPixelX(minimum);
        const barMaxWidthPixels = getPixelX(supremum) - fullBarPixelX - 2 * barPad;
        const pixelX = Math.max(0, fullBarPixelX);
        const leftShortfall = Math.abs(pixelX - fullBarPixelX);
        const leftOpacityMultiplier = leftShortfall ? 1 - Math.max(0, Math.min(1, leftShortfall / barMaxWidthPixels)) : 1;
        const barX = pixelX + barPad;
        const rightShortfall = Math.max(0, barX + barMaxWidthPixels - cartesianWidth);
        const maxBarHeight = cartesianHeight;
        const barWidthPixels = barMaxWidthPixels - rightShortfall;
        const rightOpacityMultiplier = rightShortfall
            ? 1 - Math.max(0, Math.min(1, rightShortfall / barMaxWidthPixels))
            : 1;
        const { r, g, b } = barChroma;
        const maxOpacity = barFillAlpha;
        const opacityMultiplier = leftOpacityMultiplier * rightOpacityMultiplier;
        const opacity = maxOpacity * opacityMultiplier;
        const opacityDependentLineThickness = opacityMultiplier === 1 ? 1 : Math.sqrt(opacityMultiplier);
        ctx.save();
        if (foundRow === null || foundRow === void 0 ? void 0 : foundRow.boxplot) {
            (0, boxplot_1.renderBoxplotGlyph)(ctx, barMaxWidthPixels, barX, leftShortfall, foundRow, maxBarHeight, yUnitScale, opacityMultiplier, r, g, b, maxOpacity);
        }
        else {
            (0, bar_1.renderBarGlyph)(ctx, barWidthPixels, leftShortfall, maxBarHeight, yUnitScale, foundRow, r, g, b, opacity, barX, opacityDependentLineThickness);
        }
        ctx.restore();
    }
};
exports.renderColumnBars = renderColumnBars;
//# sourceMappingURL=column.js.map