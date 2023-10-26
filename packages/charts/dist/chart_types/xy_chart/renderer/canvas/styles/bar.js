"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBarStyle = void 0;
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
const common_1 = require("../../../../../utils/common");
const texture_1 = require("../../../utils/texture");
function buildBarStyle(ctx, imgCanvas, baseColor, themeRectStyle, themeRectBorderStyle, geometryStateStyle, rect) {
    const texture = (0, texture_1.getTextureStyles)(ctx, imgCanvas, baseColor, geometryStateStyle.opacity, themeRectStyle.texture);
    const fillColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(baseColor, themeRectStyle.fill)), (opacity) => opacity * themeRectStyle.opacity * geometryStateStyle.opacity);
    const fill = {
        color: fillColor,
        texture,
    };
    const strokeColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(baseColor, themeRectBorderStyle.stroke)), (opacity) => { var _a; return opacity * geometryStateStyle.opacity * ((_a = themeRectBorderStyle.strokeOpacity) !== null && _a !== void 0 ? _a : themeRectStyle.opacity); });
    const stroke = {
        color: strokeColor,
        width: themeRectBorderStyle.visible && rect.height > themeRectBorderStyle.strokeWidth
            ? themeRectBorderStyle.strokeWidth
            : 0,
    };
    return { fill, stroke };
}
exports.buildBarStyle = buildBarStyle;
//# sourceMappingURL=bar.js.map