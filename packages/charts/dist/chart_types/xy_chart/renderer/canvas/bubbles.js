"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBubbles = void 0;
var canvas_1 = require("../../../../renderers/canvas");
var utils_1 = require("../../rendering/utils");
var points_1 = require("./points");
function renderBubbles(ctx, bubbles, sharedStyle, rotation, renderingArea, highlightedLegendItem) {
    (0, canvas_1.withContext)(ctx, function () {
        var _a;
        var styles = {};
        var allPoints = bubbles.flatMap(function (_a) {
            var _b = _a.value, seriesIdentifier = _b.seriesIdentifier, points = _b.points;
            styles[seriesIdentifier.key] = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
            return points;
        });
        var shouldClip = ((_a = allPoints[0]) === null || _a === void 0 ? void 0 : _a.value.mark) !== null;
        (0, points_1.renderPointGroup)(ctx, allPoints, styles, rotation, renderingArea, shouldClip);
    });
}
exports.renderBubbles = renderBubbles;
//# sourceMappingURL=bubbles.js.map