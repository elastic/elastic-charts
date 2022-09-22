"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderShape = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var canvas_1 = require("../../../../../renderers/canvas");
var common_1 = require("../../../../../utils/common");
var shapes_paths_1 = require("../../shapes_paths");
var line_1 = require("./line");
function renderShape(ctx, shape, _a, _b, _c) {
    var x = _a.x, y = _a.y, radius = _a.radius;
    var fillColor = _b.color;
    var width = _c.width, dash = _c.dash, strokeColor = _c.color;
    (0, canvas_1.withContext)(ctx, function () {
        var _a = __read(shapes_paths_1.ShapeRendererFn[shape], 2), pathFn = _a[0], rotation = _a[1];
        ctx.translate(x, y);
        ctx.rotate((0, common_1.degToRad)(rotation));
        ctx.beginPath();
        var path = new Path2D(pathFn(radius));
        ctx.fillStyle = (0, color_library_wrappers_1.RGBATupleToString)(fillColor);
        ctx.fill(path);
        if (width > line_1.MIN_STROKE_WIDTH) {
            ctx.strokeStyle = (0, color_library_wrappers_1.RGBATupleToString)(strokeColor);
            ctx.lineWidth = width;
            ctx.setLineDash(dash !== null && dash !== void 0 ? dash : []);
            ctx.stroke(path);
        }
    });
}
exports.renderShape = renderShape;
//# sourceMappingURL=shapes.js.map