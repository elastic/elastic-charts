"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderChartTitle = void 0;
function renderChartTitle(ctx, fontColor, chartWidth) {
    ctx.save();
    const titleFontSize = 32;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.font = `normal normal 200 ${titleFontSize}px Inter, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = fontColor;
    ctx.fillText('machine.ram', chartWidth / 2, titleFontSize * 0.5);
    ctx.fillText('KiB', chartWidth / 2, titleFontSize * 1.5);
    ctx.restore();
}
exports.renderChartTitle = renderChartTitle;
//# sourceMappingURL=chart_title.js.map