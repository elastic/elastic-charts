"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLines = void 0;
const panel_clipping_1 = require("./panel_clipping");
const points_1 = require("./points");
const path_1 = require("./primitives/path");
const line_1 = require("./styles/line");
const panel_transform_1 = require("./utils/panel_transform");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const canvas_1 = require("../../../../renderers/canvas");
const common_1 = require("../../../../utils/common");
const utils_1 = require("../../rendering/utils");
function renderLines(ctx, lines, sharedStyle, rotation, renderingArea, highlightedLegendItem) {
    (0, canvas_1.withContext)(ctx, () => {
        lines.forEach(({ panel, value: line }) => {
            var _a;
            const { style, points } = line;
            const clippings = (0, panel_clipping_1.getPanelClipping)(panel, rotation);
            if (style.line.visible) {
                (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => renderLine(ctx, line, sharedStyle, clippings, highlightedLegendItem), { area: clippings, shouldClip: true });
            }
            const visiblePoints = style.point.visible ? points : points.filter(({ isolated }) => isolated);
            if (visiblePoints.length === 0) {
                return;
            }
            const geometryStyle = (0, utils_1.getGeometryStateStyle)(line.seriesIdentifier, sharedStyle, highlightedLegendItem);
            (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => (0, points_1.renderPoints)(ctx, visiblePoints, geometryStyle), { area: clippings, shouldClip: ((_a = line.points[0]) === null || _a === void 0 ? void 0 : _a.value.mark) !== null });
        });
    });
}
exports.renderLines = renderLines;
function renderLine(ctx, line, sharedStyle, clippings, highlightedLegendItem) {
    const { color, transform, seriesIdentifier, style, clippedRanges, shouldClip } = line;
    const geometryStyle = (0, utils_1.getGeometryStateStyle)(seriesIdentifier, sharedStyle, highlightedLegendItem);
    const lineStroke = (0, line_1.buildLineStyles)(color, style.line, geometryStyle);
    const fitLineStrokeColor = style.fit.line.stroke === common_1.ColorVariant.Series ? color : style.fit.line.stroke;
    const fitLineStroke = {
        dash: style.fit.line.dash,
        width: style.line.strokeWidth,
        color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(fitLineStrokeColor), (opacity) => opacity * geometryStyle.opacity * style.fit.line.opacity),
    };
    (0, path_1.renderLinePaths)(ctx, transform, [line.line], lineStroke, fitLineStroke, clippedRanges, clippings, shouldClip && style.fit.line.visible);
}
//# sourceMappingURL=lines.js.map