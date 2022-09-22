"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBars = void 0;
var utils_1 = require("../../rendering/utils");
var panel_clipping_1 = require("./panel_clipping");
var rect_1 = require("./primitives/rect");
var bar_1 = require("./styles/bar");
var panel_transform_1 = require("./utils/panel_transform");
function renderBars(ctx, imgCanvas, geoms, sharedStyle, rotation, renderingArea, highlightedLegendItem) {
    geoms.forEach(function (_a) {
        var panel = _a.panel, bars = _a.value;
        return (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () {
            return bars.forEach(function (barGeometry) {
                var x = barGeometry.x, y = barGeometry.y, width = barGeometry.width, height = barGeometry.height, color = barGeometry.color, style = barGeometry.seriesStyle, seriesIdentifier = barGeometry.seriesIdentifier;
                var rect = { x: x, y: y, width: width, height: height };
                var geometryStateStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
                var barStyle = (0, bar_1.buildBarStyle)(ctx, imgCanvas, color, style.rect, style.rectBorder, geometryStateStyle, rect);
                (0, rect_1.renderRect)(ctx, rect, barStyle.fill, barStyle.stroke);
            });
        }, { area: (0, panel_clipping_1.getPanelClipping)(panel, rotation), shouldClip: true });
    });
}
exports.renderBars = renderBars;
//# sourceMappingURL=bars.js.map