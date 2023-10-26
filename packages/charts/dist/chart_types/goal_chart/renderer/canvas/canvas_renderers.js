"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCanvas2d = void 0;
const canvas_1 = require("../../../../renderers/canvas");
function renderCanvas2d(ctx, dpr, geomObjects, background) {
    (0, canvas_1.withContext)(ctx, () => {
        ctx.scale(dpr, dpr);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        (0, canvas_1.renderLayers)(ctx, [
            () => (0, canvas_1.clearCanvas)(ctx, background),
            () => geomObjects.forEach((mark) => (0, canvas_1.withContext)(ctx, () => mark.render(ctx))),
        ]);
    });
}
exports.renderCanvas2d = renderCanvas2d;
//# sourceMappingURL=canvas_renderers.js.map