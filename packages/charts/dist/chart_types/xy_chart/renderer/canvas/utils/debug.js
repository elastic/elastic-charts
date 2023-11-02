"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDebugRectCenterRotated = exports.renderDebugRect = void 0;
const canvas_1 = require("../../../../../renderers/canvas");
const common_1 = require("../../../../../utils/common");
const rect_1 = require("../primitives/rect");
const DEFAULT_DEBUG_FILL = {
    color: [238, 130, 238, 0.2],
};
const DEFAULT_DEBUG_STROKE = {
    color: [0, 0, 0, 0.2],
    width: 1,
};
function renderDebugRect(ctx, rect, rotation = 0, fill = DEFAULT_DEBUG_FILL, stroke = DEFAULT_DEBUG_STROKE) {
    (0, canvas_1.withContext)(ctx, () => {
        ctx.translate(rect.x, rect.y);
        ctx.rotate((0, common_1.degToRad)(rotation));
        (0, rect_1.renderRect)(ctx, { ...rect, x: 0, y: 0 }, fill, stroke, true);
    });
}
exports.renderDebugRect = renderDebugRect;
function renderDebugRectCenterRotated(ctx, center, rect, fill = DEFAULT_DEBUG_FILL, stroke = DEFAULT_DEBUG_STROKE, rotation = 0) {
    const { x, y } = center;
    (0, canvas_1.withContext)(ctx, () => {
        ctx.translate(x, y);
        ctx.rotate((0, common_1.degToRad)(rotation));
        ctx.translate(-x, -y);
        (0, rect_1.renderRect)(ctx, { ...rect, x: x - rect.width / 2, y: y - rect.height / 2 }, fill, stroke);
    });
}
exports.renderDebugRectCenterRotated = renderDebugRectCenterRotated;
//# sourceMappingURL=debug.js.map