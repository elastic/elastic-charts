"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillTextColor = exports.TRANSPARENT_LIMIT = void 0;
var color_calcs_1 = require("./color_calcs");
var color_library_wrappers_1 = require("./color_library_wrappers");
var colors_1 = require("./colors");
exports.TRANSPARENT_LIMIT = 0.6;
function fillTextColor(fallbackBGColor, foreground, background) {
    if (background === void 0) { background = colors_1.Colors.Transparent.keyword; }
    var backgroundRGBA = (0, color_library_wrappers_1.colorToRgba)(background);
    if (backgroundRGBA[3] < exports.TRANSPARENT_LIMIT) {
        backgroundRGBA = (0, color_library_wrappers_1.colorToRgba)(fallbackBGColor);
    }
    if (foreground) {
        var foregroundRGBA = (0, color_library_wrappers_1.colorToRgba)(foreground);
        var blendedFgBg = (0, color_calcs_1.combineColors)(foregroundRGBA, backgroundRGBA);
        return (0, color_library_wrappers_1.RGBATupleToString)((0, color_calcs_1.highContrastColor)(blendedFgBg));
    }
    return (0, color_library_wrappers_1.RGBATupleToString)((0, color_calcs_1.highContrastColor)(backgroundRGBA));
}
exports.fillTextColor = fillTextColor;
//# sourceMappingURL=fill_text_color.js.map