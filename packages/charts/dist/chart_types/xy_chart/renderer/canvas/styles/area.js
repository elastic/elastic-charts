"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAreaStyles = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var common_1 = require("../../../../../utils/common");
var texture_1 = require("../../../utils/texture");
function buildAreaStyles(ctx, imgCanvas, baseColor, themeAreaStyle, geometryStateStyle) {
    var texture = (0, texture_1.getTextureStyles)(ctx, imgCanvas, baseColor, geometryStateStyle.opacity, themeAreaStyle.texture);
    var color = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(baseColor, themeAreaStyle.fill)), function (opacity) { return opacity * geometryStateStyle.opacity * themeAreaStyle.opacity; });
    return {
        color: color,
        texture: texture,
    };
}
exports.buildAreaStyles = buildAreaStyles;
//# sourceMappingURL=area.js.map