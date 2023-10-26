"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderWrappedPartitionCanvas2d = void 0;
const MAX_PADDING_RATIO = 0.25;
function renderWrappedPartitionCanvas2d(ctx, dpr, { style: { sectorLineWidth: padding }, quadViewModel, diskCenter, width: panelWidth, height: panelHeight, chartDimensions: { width: containerWidth, height: containerHeight }, }) {
    const width = containerWidth * panelWidth;
    const height = containerHeight * panelHeight;
    const cornerRatio = 0.2;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.scale(dpr, dpr);
    ctx.translate(diskCenter.x, diskCenter.y);
    ctx.clearRect(0, 0, width, height);
    quadViewModel.forEach(({ fillColor, x0, x1, y0px: y0, y1px: y1 }) => {
        if (y1 - y0 <= padding)
            return;
        const fWidth = x1 - x0;
        const fPadding = Math.min(padding, MAX_PADDING_RATIO * fWidth);
        const w = fWidth - fPadding;
        const h = y1 - y0 - padding;
        const x = x0 + fPadding;
        const y = y0 + padding / 2;
        const r = cornerRatio * Math.min(w, h);
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    });
    ctx.restore();
}
exports.renderWrappedPartitionCanvas2d = renderWrappedPartitionCanvas2d;
//# sourceMappingURL=canvas_wrapped_renderers.js.map