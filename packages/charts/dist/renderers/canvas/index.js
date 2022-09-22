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
exports.withClipRanges = exports.withClip = exports.renderLayers = exports.clearCanvas = exports.withContext = void 0;
function withContext(ctx, fun) {
    ctx.save();
    fun(ctx);
    ctx.restore();
}
exports.withContext = withContext;
function clearCanvas(ctx, bgColor) {
    withContext(ctx, function () {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });
}
exports.clearCanvas = clearCanvas;
function renderLayers(ctx, layers) {
    layers.forEach(function (renderLayer) { return renderLayer(ctx); });
}
exports.renderLayers = renderLayers;
function withClip(ctx, clippings, fun, shouldClip) {
    if (shouldClip === void 0) { shouldClip = true; }
    withContext(ctx, function () {
        if (shouldClip) {
            var x = clippings.x, y = clippings.y, width = clippings.width, height = clippings.height;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
        }
        withContext(ctx, function () { return fun(ctx); });
    });
}
exports.withClip = withClip;
function withClipRanges(ctx, clippedRanges, _a, negate, fun) {
    var width = _a.width, height = _a.height, y = _a.y;
    withContext(ctx, function () {
        if (clippedRanges.length > 0) {
            ctx.beginPath();
            if (negate) {
                clippedRanges.forEach(function (_a) {
                    var _b = __read(_a, 2), x0 = _b[0], x1 = _b[1];
                    return ctx.rect(x0, y, x1 - x0, height);
                });
            }
            else {
                var firstX = clippedRanges[0][0];
                var lastX = clippedRanges[clippedRanges.length - 1][1];
                ctx.rect(0, -0.5, firstX, height);
                ctx.rect(lastX, y, width - lastX, height);
                clippedRanges.forEach(function (_a, i) {
                    var _b = __read(_a, 2), x0 = _b[1];
                    if (i < clippedRanges.length - 1)
                        ctx.rect(x0, y, clippedRanges[i + 1][0] - x0, height);
                });
            }
            ctx.clip();
        }
        fun(ctx);
    });
}
exports.withClipRanges = withClipRanges;
//# sourceMappingURL=index.js.map