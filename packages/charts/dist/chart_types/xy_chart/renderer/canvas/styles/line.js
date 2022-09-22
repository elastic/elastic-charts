"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLineStyles = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var common_1 = require("../../../../../utils/common");
function buildLineStyles(baseColor, themeLineStyle, geometryStateStyle) {
    var strokeColor = (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(baseColor, themeLineStyle.stroke)), function (opacity) { return opacity * themeLineStyle.opacity * geometryStateStyle.opacity; });
    return {
        color: strokeColor,
        width: themeLineStyle.strokeWidth,
        dash: themeLineStyle.dash,
    };
}
exports.buildLineStyles = buildLineStyles;
//# sourceMappingURL=line.js.map