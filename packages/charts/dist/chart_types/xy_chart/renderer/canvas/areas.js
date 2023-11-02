"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAreas = void 0;
const panel_clipping_1 = require("./panel_clipping");
const points_1 = require("./points");
const path_1 = require("./primitives/path");
const area_1 = require("./styles/area");
const line_1 = require("./styles/line");
const panel_transform_1 = require("./utils/panel_transform");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const canvas_1 = require("../../../../renderers/canvas");
const common_1 = require("../../../../utils/common");
const utils_1 = require("../../rendering/utils");
const texture_1 = require("../../utils/texture");
function renderAreas(ctx, imgCanvas, areas, sharedStyle, rotation, renderingArea, highlightedLegendItem) {
    (0, canvas_1.withContext)(ctx, () => {
        areas.forEach(({ panel, value: area }) => {
            const { style } = area;
            const clippings = (0, panel_clipping_1.getPanelClipping)(panel, rotation);
            if (style.area.visible) {
                (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => renderArea(ctx, imgCanvas, area, sharedStyle, clippings, highlightedLegendItem), { area: clippings, shouldClip: true });
            }
            if (style.line.visible) {
                (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => renderAreaLines(ctx, area, sharedStyle, clippings, highlightedLegendItem), { area: clippings, shouldClip: true });
            }
        });
        areas.forEach(({ panel, value: area }) => {
            var _a;
            const { style, seriesIdentifier, points } = area;
            const visiblePoints = style.point.visible ? points : points.filter(({ isolated }) => isolated);
            if (visiblePoints.length === 0) {
                return;
            }
            const geometryStateStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
            (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => (0, points_1.renderPoints)(ctx, visiblePoints, geometryStateStyle), { area: (0, panel_clipping_1.getPanelClipping)(panel, rotation), shouldClip: ((_a = points[0]) === null || _a === void 0 ? void 0 : _a.value.mark) !== null });
        });
    });
}
exports.renderAreas = renderAreas;
function renderArea(ctx, imgCanvas, geometry, sharedStyle, clippings, highlightedLegendItem) {
    const { area, color, transform, seriesIdentifier, style, clippedRanges, shouldClip } = geometry;
    const geometryStateStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
    const areaFill = (0, area_1.buildAreaStyles)(ctx, imgCanvas, color, style.area, geometryStateStyle);
    const fitAreaFillColor = style.fit.area.fill === common_1.ColorVariant.Series ? color : style.fit.area.fill;
    const fitAreaFill = {
        texture: (0, texture_1.getTextureStyles)(ctx, imgCanvas, fitAreaFillColor, geometryStateStyle.opacity, style.fit.area.texture),
        color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(fitAreaFillColor), (opacity) => opacity * geometryStateStyle.opacity * style.fit.area.opacity),
    };
    (0, path_1.renderAreaPath)(ctx, transform, area, areaFill, fitAreaFill, clippedRanges, clippings, shouldClip && style.fit.area.visible);
}
function renderAreaLines(ctx, geometry, sharedStyle, clippings, highlightedLegendItem) {
    const { lines, color, seriesIdentifier, transform, style, clippedRanges, shouldClip } = geometry;
    const geometryStateStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
    const lineStyle = (0, line_1.buildLineStyles)(color, style.line, geometryStateStyle);
    const fitLineStroke = {
        dash: style.fit.line.dash,
        width: style.line.strokeWidth,
        color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(style.fit.line.stroke === common_1.ColorVariant.Series ? color : style.fit.line.stroke), (opacity) => opacity * geometryStateStyle.opacity * style.fit.line.opacity),
    };
    (0, path_1.renderLinePaths)(ctx, transform, lines, lineStyle, fitLineStroke, clippedRanges, clippings, shouldClip && style.fit.line.visible);
}
//# sourceMappingURL=areas.js.map