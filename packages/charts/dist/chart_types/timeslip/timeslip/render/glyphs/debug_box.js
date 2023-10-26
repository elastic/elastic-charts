"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDebugBox = void 0;
function renderDebugBox(ctx, cartesianWidth, cartesianHeight) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cartesianWidth, cartesianHeight);
    ctx.strokeStyle = 'magenta';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}
exports.renderDebugBox = renderDebugBox;
//# sourceMappingURL=debug_box.js.map