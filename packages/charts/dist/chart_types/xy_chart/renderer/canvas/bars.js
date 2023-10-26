"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBars = void 0;
const panel_clipping_1 = require("./panel_clipping");
const rect_1 = require("./primitives/rect");
const bar_1 = require("./styles/bar");
const panel_transform_1 = require("./utils/panel_transform");
const utils_1 = require("../../rendering/utils");
function renderBars(ctx, imgCanvas, geoms, sharedStyle, rotation, renderingArea, highlightedLegendItem) {
    geoms.forEach(({ panel, value: bars }) => (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => bars.forEach((barGeometry) => {
        const { x, y, width, height, color, seriesStyle: style, seriesIdentifier } = barGeometry;
        const rect = { x, y, width, height };
        const geometryStateStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
        const barStyle = (0, bar_1.buildBarStyle)(ctx, imgCanvas, color, style.rect, style.rectBorder, geometryStateStyle, rect);
        (0, rect_1.renderRect)(ctx, rect, barStyle.fill, barStyle.stroke);
    }), { area: (0, panel_clipping_1.getPanelClipping)(panel, rotation), shouldClip: true }));
}
exports.renderBars = renderBars;
//# sourceMappingURL=bars.js.map