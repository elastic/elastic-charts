"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAreaPath = exports.renderLinePaths = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var canvas_1 = require("../../../../../renderers/canvas");
var line_1 = require("./line");
function renderLinePaths(ctx, transform, linePaths, stroke, fitStroke, clippedRanges, clippings, shouldClip) {
    (0, canvas_1.withClipRanges)(ctx, clippedRanges, clippings, false, function () {
        ctx.translate(transform.x, transform.y);
        (0, line_1.renderMultiLine)(ctx, linePaths, stroke);
    });
    if (clippedRanges.length > 0 && shouldClip) {
        (0, canvas_1.withClipRanges)(ctx, clippedRanges, clippings, true, function () {
            ctx.translate(transform.x, transform.y);
            (0, line_1.renderMultiLine)(ctx, linePaths, fitStroke);
        });
    }
}
exports.renderLinePaths = renderLinePaths;
function renderAreaPath(ctx, transform, area, fill, fitFill, clippedRanges, clippings, shouldClip) {
    (0, canvas_1.withClipRanges)(ctx, clippedRanges, clippings, false, function () { return renderPathFill(ctx, area, fill, transform); });
    if (clippedRanges.length > 0 && shouldClip) {
        (0, canvas_1.withClipRanges)(ctx, clippedRanges, clippings, true, function () { return renderPathFill(ctx, area, fitFill, transform); });
    }
}
exports.renderAreaPath = renderAreaPath;
function renderPathFill(ctx, path, fill, _a) {
    var x = _a.x, y = _a.y;
    ctx.translate(x, y);
    var path2d = new Path2D(path);
    ctx.fillStyle = (0, color_library_wrappers_1.RGBATupleToString)(fill.color);
    ctx.fill(path2d);
    if (fill.texture) {
        ctx.fillStyle = fill.texture.pattern;
        ctx.fill(path2d);
    }
}
//# sourceMappingURL=path.js.map