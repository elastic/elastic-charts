"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAreas = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var canvas_1 = require("../../../../renderers/canvas");
var common_1 = require("../../../../utils/common");
var utils_1 = require("../../rendering/utils");
var texture_1 = require("../../utils/texture");
var panel_clipping_1 = require("./panel_clipping");
var points_1 = require("./points");
var path_1 = require("./primitives/path");
var area_1 = require("./styles/area");
var line_1 = require("./styles/line");
var panel_transform_1 = require("./utils/panel_transform");
function renderAreas(ctx, imgCanvas, areas, sharedStyle, rotation, renderingArea, highlightedLegendItem) {
    (0, canvas_1.withContext)(ctx, function () {
        areas.forEach(function (_a) {
            var panel = _a.panel, area = _a.value;
            var style = area.style;
            var clippings = (0, panel_clipping_1.getPanelClipping)(panel, rotation);
            if (style.area.visible) {
                (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () { return renderArea(ctx, imgCanvas, area, sharedStyle, clippings, highlightedLegendItem); }, { area: clippings, shouldClip: true });
            }
            if (style.line.visible) {
                (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () { return renderAreaLines(ctx, area, sharedStyle, clippings, highlightedLegendItem); }, { area: clippings, shouldClip: true });
            }
        });
        areas.forEach(function (_a) {
            var _b;
            var panel = _a.panel, area = _a.value;
            var style = area.style, seriesIdentifier = area.seriesIdentifier, points = area.points;
            var visiblePoints = style.point.visible ? points : points.filter(function (_a) {
                var orphan = _a.orphan;
                return orphan;
            });
            if (visiblePoints.length === 0) {
                return;
            }
            var geometryStateStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
            (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () { return (0, points_1.renderPoints)(ctx, visiblePoints, geometryStateStyle); }, { area: (0, panel_clipping_1.getPanelClipping)(panel, rotation), shouldClip: ((_b = points[0]) === null || _b === void 0 ? void 0 : _b.value.mark) !== null });
        });
    });
}
exports.renderAreas = renderAreas;
function renderArea(ctx, imgCanvas, geometry, sharedStyle, clippings, highlightedLegendItem) {
    var area = geometry.area, color = geometry.color, transform = geometry.transform, seriesIdentifier = geometry.seriesIdentifier, style = geometry.style, clippedRanges = geometry.clippedRanges, shouldClip = geometry.shouldClip;
    var geometryStateStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
    var areaFill = (0, area_1.buildAreaStyles)(ctx, imgCanvas, color, style.area, geometryStateStyle);
    var fitAreaFillColor = style.fit.area.fill === common_1.ColorVariant.Series ? color : style.fit.area.fill;
    var fitAreaFill = {
        texture: (0, texture_1.getTextureStyles)(ctx, imgCanvas, fitAreaFillColor, geometryStateStyle.opacity, style.fit.area.texture),
        color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(fitAreaFillColor), function (opacity) { return opacity * geometryStateStyle.opacity * style.fit.area.opacity; }),
    };
    (0, path_1.renderAreaPath)(ctx, transform, area, areaFill, fitAreaFill, clippedRanges, clippings, shouldClip && style.fit.area.visible);
}
function renderAreaLines(ctx, geometry, sharedStyle, clippings, highlightedLegendItem) {
    var lines = geometry.lines, color = geometry.color, seriesIdentifier = geometry.seriesIdentifier, transform = geometry.transform, style = geometry.style, clippedRanges = geometry.clippedRanges, shouldClip = geometry.shouldClip;
    var geometryStateStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
    var lineStyle = (0, line_1.buildLineStyles)(color, style.line, geometryStateStyle);
    var fitLineStroke = {
        dash: style.fit.line.dash,
        width: style.line.strokeWidth,
        color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(style.fit.line.stroke === common_1.ColorVariant.Series ? color : style.fit.line.stroke), function (opacity) { return opacity * geometryStateStyle.opacity * style.fit.line.opacity; }),
    };
    (0, path_1.renderLinePaths)(ctx, transform, lines, lineStyle, fitLineStroke, clippedRanges, clippings, shouldClip && style.fit.line.visible);
}
//# sourceMappingURL=areas.js.map