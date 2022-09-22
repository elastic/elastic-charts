"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLines = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var canvas_1 = require("../../../../renderers/canvas");
var common_1 = require("../../../../utils/common");
var utils_1 = require("../../rendering/utils");
var panel_clipping_1 = require("./panel_clipping");
var points_1 = require("./points");
var path_1 = require("./primitives/path");
var line_1 = require("./styles/line");
var panel_transform_1 = require("./utils/panel_transform");
function renderLines(ctx, lines, sharedStyle, rotation, renderingArea, highlightedLegendItem) {
    (0, canvas_1.withContext)(ctx, function () {
        lines.forEach(function (_a) {
            var _b;
            var panel = _a.panel, line = _a.value;
            var style = line.style, points = line.points;
            var clippings = (0, panel_clipping_1.getPanelClipping)(panel, rotation);
            if (style.line.visible) {
                (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () { return renderLine(ctx, line, sharedStyle, clippings, highlightedLegendItem); }, { area: clippings, shouldClip: true });
            }
            var visiblePoints = style.point.visible ? points : points.filter(function (_a) {
                var orphan = _a.orphan;
                return orphan;
            });
            if (visiblePoints.length === 0) {
                return;
            }
            var geometryStyle = (0, utils_1.getGeometryStateStyle)(line.seriesIdentifier, sharedStyle, highlightedLegendItem);
            (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () { return (0, points_1.renderPoints)(ctx, visiblePoints, geometryStyle); }, { area: clippings, shouldClip: ((_b = line.points[0]) === null || _b === void 0 ? void 0 : _b.value.mark) !== null });
        });
    });
}
exports.renderLines = renderLines;
function renderLine(ctx, line, sharedStyle, clippings, highlightedLegendItem) {
    var color = line.color, transform = line.transform, seriesIdentifier = line.seriesIdentifier, style = line.style, clippedRanges = line.clippedRanges, shouldClip = line.shouldClip;
    var geometryStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
    var lineStroke = (0, line_1.buildLineStyles)(color, style.line, geometryStyle);
    var fitLineStrokeColor = style.fit.line.stroke === common_1.ColorVariant.Series ? color : style.fit.line.stroke;
    var fitLineStroke = {
        dash: style.fit.line.dash,
        width: style.line.strokeWidth,
        color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(fitLineStrokeColor), function (opacity) { return opacity * geometryStyle.opacity * style.fit.line.opacity; }),
    };
    (0, path_1.renderLinePaths)(ctx, transform, [line.line], lineStroke, fitLineStroke, clippedRanges, clippings, shouldClip && style.fit.line.visible);
}
//# sourceMappingURL=lines.js.map