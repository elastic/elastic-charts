"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRectAnnotations = void 0;
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
const rect_1 = require("../primitives/rect");
const panel_transform_1 = require("../utils/panel_transform");
function renderRectAnnotations(ctx, aCtx, annotations, rectStyle, getHoverParams, rotation, renderingArea) {
    const getFillAndStroke = (id) => {
        const { style, options } = getHoverParams(id);
        const opacityKey = `anno-rect-opacity--${id}`;
        const hoverOpacity = aCtx.getValue(options)(opacityKey, style.opacity);
        const fill = {
            color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(rectStyle.fill), (opacity) => opacity * rectStyle.opacity * hoverOpacity),
        };
        const stroke = {
            color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)(rectStyle.stroke), (opacity) => opacity * rectStyle.opacity * hoverOpacity),
            width: rectStyle.strokeWidth,
        };
        return [fill, stroke];
    };
    annotations.forEach(({ rect, panel, id }) => (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => (0, rect_1.renderRect)(ctx, rect, ...getFillAndStroke(id))));
}
exports.renderRectAnnotations = renderRectAnnotations;
//# sourceMappingURL=rect.js.map