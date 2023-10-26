"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMultiLine = exports.MIN_STROKE_WIDTH = void 0;
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
const canvas_1 = require("../../../../../renderers/canvas");
exports.MIN_STROKE_WIDTH = 0.001;
function renderMultiLine(ctx, lines, stroke) {
    if (stroke.width < exports.MIN_STROKE_WIDTH || lines.length === 0) {
        return;
    }
    (0, canvas_1.withContext)(ctx, () => {
        ctx.strokeStyle = (0, color_library_wrappers_1.RGBATupleToString)(stroke.color);
        ctx.lineJoin = 'round';
        ctx.lineWidth = stroke.width;
        if (stroke.dash) {
            ctx.setLineDash(stroke.dash);
        }
        ctx.beginPath();
        for (const line of lines) {
            if (typeof line === 'string') {
                ctx.stroke(new Path2D(line));
            }
            else {
                ctx.moveTo(line.x1, line.y1);
                ctx.lineTo(line.x2, line.y2);
            }
        }
        ctx.stroke();
    });
}
exports.renderMultiLine = renderMultiLine;
//# sourceMappingURL=line.js.map