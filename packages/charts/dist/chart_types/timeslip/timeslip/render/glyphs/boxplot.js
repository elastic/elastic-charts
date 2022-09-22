"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBoxplotGlyph = void 0;
function renderBoxplotGlyph(ctx, barMaxWidthPixels, barX, leftShortfall, foundRow, maxBarHeight, yUnitScaleClamped, opacityMultiplier, r, g, b, maxOpacity) {
    var goldenRatio = 1.618;
    var boxplotWidth = barMaxWidthPixels / goldenRatio;
    var whiskerWidth = boxplotWidth / 2;
    var boxplotLeftX = barX + (barMaxWidthPixels - boxplotWidth) / 2 - leftShortfall;
    var boxplotCenterX = boxplotLeftX + boxplotWidth / 2;
    var _a = foundRow.boxplot, lower = _a.lower, q1 = _a.q1, q2 = _a.q2, q3 = _a.q3, upper = _a.upper;
    var lowerY = maxBarHeight * yUnitScaleClamped(lower);
    var q1Y = maxBarHeight * yUnitScaleClamped(q1);
    var q2Y = maxBarHeight * yUnitScaleClamped(q2);
    var q3Y = maxBarHeight * yUnitScaleClamped(q3);
    var upperY = maxBarHeight * yUnitScaleClamped(upper);
    if (lowerY !== upperY && q1Y !== q2Y && q2Y !== q3Y) {
        var unitVisibility = Math.pow(opacityMultiplier, 5);
        ctx.beginPath();
        ctx.rect(boxplotLeftX, -q3Y, boxplotWidth, q3Y - q1Y);
        ctx.fillStyle = "rgba(".concat(r, ",").concat(g, ",").concat(b, ",").concat(maxOpacity * unitVisibility, ")");
        ctx.fill();
        ctx.strokeStyle = "rgba(".concat(r, ",").concat(g, ",").concat(b, ",1)");
        ctx.lineWidth = unitVisibility;
        ctx.fillStyle = "rgba(".concat(r, ",").concat(g, ",").concat(b, ",1)");
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