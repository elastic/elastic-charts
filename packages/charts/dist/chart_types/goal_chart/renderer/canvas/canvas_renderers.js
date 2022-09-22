"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCanvas2d = void 0;
var canvas_1 = require("../../../../renderers/canvas");
function renderCanvas2d(ctx, dpr, geomObjects, background) {
    (0, canvas_1.withContext)(ctx, function () {
        ctx.scale(dpr, dpr);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        (0, canvas_1.renderLayers)(ctx, [
            function () { return (0, canvas_1.clearCanvas)(ctx, background); },
            function () { return geomObjects.forEach(function (mark) { return (0, canvas_1.withContext)(ctx, function () { return mark.render(ctx); }); }); },
        ]);
    });
}
exports.renderCanvas2d = renderCanvas2d;
//# sourceMappingURL=canvas_renderers.js.map