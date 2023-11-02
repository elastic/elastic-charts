"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAxisLine = void 0;
const common_1 = require("../../../../../utils/common");
function renderAxisLine(ctx, { axisSpec: { position: p }, size: { width, height }, axisStyle: { axisLine } }) {
    if (!axisLine.visible)
        return;
    ctx.beginPath();
    ctx.moveTo(p === common_1.Position.Left ? width : 0, p === common_1.Position.Top ? height : 0);
    ctx.lineTo(p !== common_1.Position.Right ? width : 0, p !== common_1.Position.Bottom ? height : 0);
    ctx.strokeStyle = axisLine.stroke;
    ctx.lineWidth = axisLine.strokeWidth;
    ctx.stroke();
}
exports.renderAxisLine = renderAxisLine;
//# sourceMappingURL=line.js.map