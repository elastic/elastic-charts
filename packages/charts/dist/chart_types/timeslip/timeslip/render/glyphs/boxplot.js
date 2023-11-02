"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBoxplotGlyph = void 0;
const goldenRatio = 1.618;
function renderBoxplotGlyph(ctx, barMaxWidthPixels, barX, leftShortfall, foundRow, maxBarHeight, yUnitScale, opacityMultiplier, r, g, b, maxOpacity) {
    const boxplotWidth = barMaxWidthPixels / goldenRatio;
    const whiskerWidth = boxplotWidth / 2;
    const boxplotLeftX = barX + (barMaxWidthPixels - boxplotWidth) / 2 - leftShortfall;
    const boxplotCenterX = boxplotLeftX + boxplotWidth / 2;
    const { lower, q1, q2, q3, upper } = foundRow.boxplot;
    const lowerY = maxBarHeight * yUnitScale(lower);
    const q1Y = maxBarHeight * yUnitScale(q1);
    const q2Y = maxBarHeight * yUnitScale(q2);
    const q3Y = maxBarHeight * yUnitScale(q3);
    const upperY = maxBarHeight * yUnitScale(upper);
    if (lowerY !== upperY && q1Y !== q2Y && q2Y !== q3Y) {
        const unitVisibility = opacityMultiplier ** 5;
        ctx.beginPath();
        ctx.rect(boxplotLeftX, -q3Y, boxplotWidth, q3Y - q1Y);
        ctx.fillStyle = `rgba(${r},${g},${b},${maxOpacity * unitVisibility})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${r},${g},${b},1)`;
        ctx.lineWidth = unitVisibility;
        ctx.fillStyle = `rgba(${r},${g},${b},1)`;
        ctx.fillRect(boxplotCenterX - whiskerWidth / 2, -upperY, whiskerWidth, unitVisibility);
        ctx.fillRect(boxplotCenterX - boxplotWidth / 2, -q3Y, boxplotWidth, unitVisibility);
        ctx.fillRect(boxplotCenterX - boxplotWidth / 2, -q2Y, boxplotWidth, unitVisibility);
        ctx.fillRect(boxplotCenterX - boxplotWidth / 2, -q1Y, boxplotWidth, unitVisibility);
        ctx.fillRect(boxplotCenterX - whiskerWidth / 2, -lowerY, whiskerWidth, unitVisibility);
        ctx.fillRect(boxplotCenterX, -upperY, unitVisibility, upperY - q3Y);
        ctx.fillRect(boxplotCenterX, -q1Y, unitVisibility, q1Y - lowerY);
    }
}
exports.renderBoxplotGlyph = renderBoxplotGlyph;
//# sourceMappingURL=boxplot.js.map