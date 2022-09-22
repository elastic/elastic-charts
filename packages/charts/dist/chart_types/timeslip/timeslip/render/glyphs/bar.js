"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBarGlyph = void 0;
function renderBarGlyph(ctx, barWidthPixels, leftShortfall, maxBarHeight, yUnitScale, foundRow, yUnitScaleClamped, r, g, b, opacity, barX, opacityDependentLineThickness) {
    var renderedBarWidth = Math.max(0, barWidthPixels - leftShortfall);
    var barEnd = -maxBarHeight * yUnitScale(foundRow.value);
    var clampedBarEnd = -maxBarHeight * yUnitScaleClamped(foundRow.value);
    var clampedBarStart = -maxBarHeight * yUnitScaleClamped(0);
    var barHeight = Math.abs(clampedBarStart - clampedBarEnd);
    var barY = Math.min(clampedBarStart, clampedBarEnd);
    ctx.fillStyle = "rgba(".concat(r, ",").concat(g, ",").concat(b, ",").concat(opacity, ")");
    ctx.fillRect(barX, barY, renderedBarWidth, barHeight);
    if (clampedBarEnd === barEnd) {
        ctx.fillStyle = "rgba(".concat(r, ",").concat(g, ",").concat(b, ",1)");
        ctx.fillRect(barX, clampedBarEnd, renderedBarWidth, opacityDependentLineThickness);
    }
}
exports.renderBarGlyph = renderBarGlyph;
//# sourceMappingURL=bar.js.map