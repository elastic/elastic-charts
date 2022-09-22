"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBarStyle = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var common_1 = require("../../../../../utils/common");
var texture_1 = require("../../../utils/texture");
function buildBarStyle(ctx, imgCanvas, baseColor, themeRectStyle, themeRectBorderStyle, geometryStateStyle, rect) {
    var texture = (0, texture_1.getTextureStyles)(ctx, imgCanvas, baseColor, geometryStateStyle.opacity, themeRectStyle.texture);
    var fillColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(baseColor, themeRectStyle.fill)), function (opacity) { return opacity * themeRectStyle.opacity * geometryStateStyle.opacity; });
    var fill = {
        color: fillColor,
        texture: texture,
    };
    var strokeColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(baseColor, themeRectBorderStyle.stroke)), function (opacity) { var _a; return opacity * geometryStateStyle.opacity * ((_a = themeRectBorderStyle.strokeOpacity) !== null && _a !== void 0 ? _a : themeRectStyle.opacity); });
    var stroke = {
        color: strokeColor,
        width: themeRectBorderStyle.visible && rect.height > themeRectBorderStyle.strokeWidth
            ? themeRectBorderStyle.strokeWidth
            : 0,
    };
    return { fill: fill, stroke: stroke };
}
exports.buildBarStyle = buildBarStyle;
//# sourceMappingURL=bar.js.map