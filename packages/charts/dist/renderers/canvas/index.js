"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withClipRanges = exports.withClip = exports.renderLayers = exports.clearCanvas = exports.withContext = void 0;
function withContext(ctx, fun) {
    ctx.save();
    fun(ctx);
    ctx.restore();
}
exports.withContext = withContext;
function clearCanvas(ctx, bgColor) {
    withContext(ctx, () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });
}
exports.clearCanvas = clearCanvas;
function renderLayers(ctx, layers) {
    layers.forEach((renderLayer) => renderLayer(ctx));
}
exports.renderLayers = renderLayers;
function withClip(ctx, clippings, fun, shouldClip = true) {
    withContext(ctx, () => {
        if (shouldClip) {
            const { x, y, width, height } = clippings;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
        }
        withContext(ctx, () => fun(ctx));
    });
}
exports.withClip = withClip;
function withClipRanges(ctx, clippedRanges, { width, height, y }, negate, fun) {
    withContext(ctx, () => {
        var _a, _b, _c, _d;
        if (clippedRanges.length > 0) {
            ctx.beginPath();
            if (negate) {
                clippedRanges.forEach(([x0, x1]) => ctx.rect(x0, y, x1 - x0, height));
            }
            else {
                const firstX = (_b = (_a = clippedRanges[0]) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : NaN;
                const lastX = (_d = (_c = clippedRanges.at(-1)) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : NaN;
                ctx.rect(0, -0.5, firstX, height);
                ctx.rect(lastX, y, width - lastX, height);
                clippedRanges.forEach(([, x0], i) => {
                    var _a, _b;
                    if (i < clippedRanges.length - 1) {
                        ctx.rect(x0, y, ((_b = (_a = clippedRanges[i + 1]) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : NaN) - x0, height);
                    }
                });
            }
            ctx.clip();
        }
        fun(ctx);
    });
}
exports.withClipRanges = withClipRanges;
//# sourceMappingURL=index.js.map