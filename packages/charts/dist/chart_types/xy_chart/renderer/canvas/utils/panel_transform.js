"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPanelTransform = void 0;
const canvas_1 = require("../../../../../renderers/canvas");
const common_1 = require("../../../../../utils/common");
const utils_1 = require("../../../state/utils/utils");
function withPanelTransform(ctx, panel, rotation, renderingArea, fn, clippings) {
    const transform = (0, utils_1.computeChartTransform)(panel, rotation);
    (0, canvas_1.withContext)(ctx, () => {
        ctx.translate(renderingArea.left + panel.left + transform.x, renderingArea.top + panel.top + transform.y);
        ctx.rotate((0, common_1.degToRad)(rotation));
        if (clippings === null || clippings === void 0 ? void 0 : clippings.shouldClip) {
            const { x, y, width, height } = clippings.area;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
        }
        fn(ctx);
    });
}
exports.withPanelTransform = withPanelTransform;
//# sourceMappingURL=panel_transform.js.map