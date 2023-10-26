"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderShape = void 0;
const line_1 = require("./line");
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
const canvas_1 = require("../../../../../renderers/canvas");
const common_1 = require("../../../../../utils/common");
const shapes_paths_1 = require("../../shapes_paths");
function renderShape(ctx, shape, { x, y, radius }, { color: fillColor }, { width, dash, color: strokeColor }) {
    (0, canvas_1.withContext)(ctx, () => {
        const [pathFn, rotation] = shapes_paths_1.ShapeRendererFn[shape];
        ctx.translate(x, y);
        ctx.rotate((0, common_1.degToRad)(rotation));
        ctx.beginPath();
        const path = new Path2D(pathFn(radius));
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