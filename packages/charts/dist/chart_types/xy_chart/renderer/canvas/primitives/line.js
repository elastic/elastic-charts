"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMultiLine = exports.MIN_STROKE_WIDTH = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var canvas_1 = require("../../../../../renderers/canvas");
exports.MIN_STROKE_WIDTH = 0.001;
function renderMultiLine(ctx, lines, stroke) {
    if (stroke.width < exports.MIN_STROKE_WIDTH || lines.length === 0) {
        return;
    }
    (0, canvas_1.withContext)(ctx, function () {
        var e_1, _a;
        ctx.strokeStyle = (0, color_library_wrappers_1.RGBATupleToString)(stroke.color);
        ctx.lineJoin = 'round';
        ctx.lineWidth = stroke.width;
        if (stroke.dash) {
            ctx.setLineDash(stroke.dash);
        }
        ctx.beginPath();
        try {
            for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
                var line = lines_1_1.value;
                if (typeof line === 'string') {
                    ctx.stroke(new Path2D(line));
                }
                else {
                    ctx.moveTo(line.x1, line.y1);
                    ctx.lineTo(line.x2, line.y2);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        ctx.stroke();
    });
}
exports.renderMultiLine = renderMultiLine;
//# sourceMappingURL=line.js.map