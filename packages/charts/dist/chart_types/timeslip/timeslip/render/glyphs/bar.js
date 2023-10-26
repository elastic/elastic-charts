"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBarGlyph = void 0;
function renderBarGlyph(ctx, barWidthPixels, leftShortfall, maxBarHeight, yUnitScale, foundRow, r, g, b, opacity, barX, opacityDependentLineThickness) {
    const renderedBarWidth = Math.max(0, barWidthPixels - leftShortfall);
    const barEnd = -maxBarHeight * yUnitScale(foundRow.value);
    const barStart = -maxBarHeight * yUnitScale(0);
    const barHeight = Math.abs(barStart - barEnd);
    const barY = Math.min(barStart, barEnd);
    ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
    ctx.fillRect(barX, barY, renderedBarWidth, barHeight);
    if (barEnd === barEnd) {
        ctx.fillStyle = `rgba(${r},${g},${b},1)`;
        ctx.fillRect(barX, barEnd, renderedBarWidth, opacityDependentLineThickness);
    }
}
exports.renderBarGlyph = renderBarGlyph;
//# sourceMappingURL=bar.js.map