"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLineAnnotations = void 0;
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
const line_1 = require("../primitives/line");
const panel_transform_1 = require("../utils/panel_transform");
function renderLineAnnotations(ctx, aCtx, annotations, lineStyle, getHoverParams, rotation, renderingArea) {
    const getStroke = (id) => {
        const { style, options } = getHoverParams(id);
        const opacityKey = `anno-rect-opacity--${id}`;
        const hoverOpacity = aCtx.getValue(options)(opacityKey, style.opacity);
        const strokeColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(lineStyle.line.stroke), (opacity) => opacity * lineStyle.line.opacity * hoverOpacity);
        return {
            color: strokeColor,
            width: lineStyle.line.strokeWidth,
            dash: lineStyle.line.dash,
        };
    };
    annotations.forEach(({ linePathPoints, panel, id }) => (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => (0, line_1.renderMultiLine)(ctx, [linePathPoints], getStroke(id))));
}
exports.renderLineAnnotations = renderLineAnnotations;
//# sourceMappingURL=lines.js.map