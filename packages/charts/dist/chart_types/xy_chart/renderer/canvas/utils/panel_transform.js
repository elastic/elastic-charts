"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPanelTransform = void 0;
var canvas_1 = require("../../../../../renderers/canvas");
var common_1 = require("../../../../../utils/common");
var utils_1 = require("../../../state/utils/utils");
function withPanelTransform(ctx, panel, rotation, renderingArea, fn, clippings) {
    var transform = (0, utils_1.computeChartTransform)(panel, rotation);
    (0, canvas_1.withContext)(ctx, function () {
        ctx.translate(renderingArea.left + panel.left + transform.x, renderingArea.top + panel.top + transform.y);
        ctx.rotate((0, common_1.degToRad)(rotation));
        if (clippings === null || clippings === void 0 ? void 0 : clippings.shouldClip) {
            var _a = clippings.area, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
        }
        fn(ctx);
    });
}
exports.withPanelTransform = withPanelTransform;
//# sourceMappingURL=panel_transform.js.map