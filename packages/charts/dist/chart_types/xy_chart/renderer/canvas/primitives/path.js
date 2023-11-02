"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAreaPath = exports.renderLinePaths = void 0;
const line_1 = require("./line");
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
const canvas_1 = require("../../../../../renderers/canvas");
function renderLinePaths(ctx, transform, linePaths, stroke, fitStroke, clippedRanges, clippings, shouldClip) {
    (0, canvas_1.withClipRanges)(ctx, clippedRanges, clippings, false, () => {
        ctx.translate(transform.x, transform.y);
        (0, line_1.renderMultiLine)(ctx, linePaths, stroke);
    });
    if (clippedRanges.length > 0 && shouldClip) {
        (0, canvas_1.withClipRanges)(ctx, clippedRanges, clippings, true, () => {
            ctx.translate(transform.x, transform.y);
            (0, line_1.renderMultiLine)(ctx, linePaths, fitStroke);
        });
    }
}
exports.renderLinePaths = renderLinePaths;
function renderAreaPath(ctx, transform, area, fill, fitFill, clippedRanges, clippings, shouldClip) {
    (0, canvas_1.withClipRanges)(ctx, clippedRanges, clippings, false, () => renderPathFill(ctx, area, fill, transform));
    if (clippedRanges.length > 0 && shouldClip) {
        (0, canvas_1.withClipRanges)(ctx, clippedRanges, clippings, true, () => renderPathFill(ctx, area, fitFill, transform));
    }
}
exports.renderAreaPath = renderAreaPath;
function renderPathFill(ctx, path, fill, { x, y }) {
    ctx.translate(x, y);
    const path2d = new Path2D(path);
    ctx.fillStyle = (0, color_library_wrappers_1.RGBATupleToString)(fill.color);
    ctx.fill(path2d);
    if (fill.texture) {
        ctx.fillStyle = fill.texture.pattern;
        ctx.fill(path2d);
    }
}
//# sourceMappingURL=path.js.map