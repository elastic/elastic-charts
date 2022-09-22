"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderGrids = void 0;
var canvas_1 = require("../../../../renderers/canvas");
var line_1 = require("./primitives/line");
function renderGrids(ctx, _a) {
    var perPanelGridLines = _a.perPanelGridLines, _b = _a.renderingArea, left = _b.left, top = _b.top;
    (0, canvas_1.withContext)(ctx, function () {
        ctx.translate(left, top);
        perPanelGridLines.forEach(function (_a) {
            var lineGroups = _a.lineGroups, _b = _a.panelAnchor, x = _b.x, y = _b.y;
            (0, canvas_1.withContext)(ctx, function () {
                ctx.translate(x, y);
                lineGroups.forEach(function (_a) {
                    var lines = _a.lines, stroke = _a.stroke;
                    return (0, line_1.renderMultiLine)(ctx, lines, stroke);
                });
            });
        });
    });
}
exports.renderGrids = renderGrids;
//# sourceMappingURL=grids.js.map