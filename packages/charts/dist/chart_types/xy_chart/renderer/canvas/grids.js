"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderGrids = void 0;
const line_1 = require("./primitives/line");
const canvas_1 = require("../../../../renderers/canvas");
function renderGrids(ctx, { perPanelGridLines, renderingArea: { left, top } }) {
    (0, canvas_1.withContext)(ctx, () => {
        ctx.translate(left, top);
        perPanelGridLines.forEach(({ lineGroups, panelAnchor: { x, y } }) => {
            (0, canvas_1.withContext)(ctx, () => {
                ctx.translate(x, y);
                lineGroups.forEach(({ lines, stroke }) => (0, line_1.renderMultiLine)(ctx, lines, stroke));
            });
        });
    });
}
exports.renderGrids = renderGrids;
//# sourceMappingURL=grids.js.map