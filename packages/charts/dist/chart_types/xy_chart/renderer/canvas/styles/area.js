"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAreaStyles = void 0;
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
const common_1 = require("../../../../../utils/common");
const texture_1 = require("../../../utils/texture");
function buildAreaStyles(ctx, imgCanvas, baseColor, themeAreaStyle, geometryStateStyle) {
    const texture = (0, texture_1.getTextureStyles)(ctx, imgCanvas, baseColor, geometryStateStyle.opacity, themeAreaStyle.texture);
    const color = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(baseColor, themeAreaStyle.fill)), (opacity) => opacity * geometryStateStyle.opacity * themeAreaStyle.opacity);
    return {
        color,
        texture,
    };
}
exports.buildAreaStyles = buildAreaStyles;
//# sourceMappingURL=area.js.map