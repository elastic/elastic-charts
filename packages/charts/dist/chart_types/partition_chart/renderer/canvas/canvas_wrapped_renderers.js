"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderWrappedPartitionCanvas2d = void 0;
var MAX_PADDING_RATIO = 0.25;
function renderWrappedPartitionCanvas2d(ctx, dpr, _a) {
    var padding = _a.style.sectorLineWidth, quadViewModel = _a.quadViewModel, diskCenter = _a.diskCenter, panelWidth = _a.width, panelHeight = _a.height, _b = _a.chartDimensions, containerWidth = _b.width, containerHeight = _b.height;
    var width = containerWidth * panelWidth;
    var height = containerHeight * panelHeight;
    var cornerRatio = 0.2;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.scale(dpr, dpr);
    ctx.translate(diskCenter.x, diskCenter.y);
    ctx.clearRect(0, 0, width, height);
    quadViewModel.forEach(function (_a) {
        var fillColor = _a.fillColor, x0 = _a.x0, x1 = _a.x1, y0 = _a.y0px, y1 = _a.y1px;
        if (y1 - y0 <= padding)
            return;
        var fWidth = x1 - x0;
        var fPadding = Math.min(padding, MAX_PADDING_RATIO * fWidth);
        var paintedWidth = fWidth - fPadding;
        var paintedHeight = y1 - y0 - padding;
        var cornerRadius = 2 * cornerRatio * Math.min(paintedWidth, paintedHeight);
        var halfRadius = cornerRadius / 2;
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = cornerRadius;
        ctx.beginPath();
        ctx.rect(x0 + fPadding + halfRadius, y0 + padding / 2 + halfRadius, paintedWidth - cornerRadius, paintedHeight - cornerRadius);
        ctx.fill();
        ctx.stroke();
    });
    ctx.restore();
}
exports.renderWrappedPartitionCanvas2d = renderWrappedPartitionCanvas2d;
//# sourceMappingURL=canvas_wrapped_renderers.js.map