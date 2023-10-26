"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBubbles = void 0;
const points_1 = require("./points");
const canvas_1 = require("../../../../renderers/canvas");
const utils_1 = require("../../rendering/utils");
function renderBubbles(ctx, bubbles, sharedStyle, rotation, renderingArea, highlightedLegendItem) {
    (0, canvas_1.withContext)(ctx, () => {
        var _a;
        const styles = {};
        const allPoints = bubbles.flatMap(({ value: { seriesIdentifier, points } }) => {
            styles[seriesIdentifier.key] = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
            return points;
        });
        const shouldClip = ((_a = allPoints[0]) === null || _a === void 0 ? void 0 : _a.value.mark) !== null;
        (0, points_1.renderPointGroup)(ctx, allPoints, styles, rotation, renderingArea, shouldClip);
    });
}
exports.renderBubbles = renderBubbles;
//# sourceMappingURL=bubbles.js.map