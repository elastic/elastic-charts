"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDebugRectCenterRotated = exports.renderDebugRect = void 0;
var canvas_1 = require("../../../../../renderers/canvas");
var common_1 = require("../../../../../utils/common");
var rect_1 = require("../primitives/rect");
var DEFAULT_DEBUG_FILL = {
    color: [238, 130, 238, 0.2],
};
var DEFAULT_DEBUG_STROKE = {
    color: [0, 0, 0, 0.2],
    width: 1,
};
function renderDebugRect(ctx, rect, rotation, fill, stroke) {
    if (rotation === void 0) { rotation = 0; }
    if (fill === void 0) { fill = DEFAULT_DEBUG_FILL; }
    if (stroke === void 0) { stroke = DEFAULT_DEBUG_STROKE; }
    (0, canvas_1.withContext)(ctx, function () {
        ctx.translate(rect.x, rect.y);
        ctx.rotate((0, common_1.degToRad)(rotation));
        (0, rect_1.renderRect)(ctx, __assign(__assign({}, rect), { x: 0, y: 0 }), fill, stroke, true);
    });
}
exports.renderDebugRect = renderDebugRect;
function renderDebugRectCenterRotated(ctx, center, rect, fill, stroke, rotation) {
    if (fill === void 0) { fill = DEFAULT_DEBUG_FILL; }
    if (stroke === void 0) { stroke = DEFAULT_DEBUG_STROKE; }
    if (rotation === void 0) { rotation = 0; }
    var x = center.x, y = center.y;
    (0, canvas_1.withContext)(ctx, function () {
        ctx.translate(x, y);
        ctx.rotate((0, common_1.degToRad)(rotation));
        ctx.translate(-x, -y);
        (0, rect_1.renderRect)(ctx, __assign(__assign({}, rect), { x: x - rect.width / 2, y: y - rect.height / 2 }), fill, stroke);
    });
}
exports.renderDebugRectCenterRotated = renderDebugRectCenterRotated;
//# sourceMappingURL=debug.js.map