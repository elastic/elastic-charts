"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolvedBackgroundColor = exports.fillTextColor = exports.TRANSPARENT_LIMIT = void 0;
const color_calcs_1 = require("./color_calcs");
const color_library_wrappers_1 = require("./color_library_wrappers");
const colors_1 = require("./colors");
exports.TRANSPARENT_LIMIT = 0.6;
function fillTextColor(fallbackBGColor, foreground, background = colors_1.Colors.Transparent.keyword, options) {
    let backgroundRGBA = (0, color_library_wrappers_1.colorToRgba)(background);
    if (backgroundRGBA[3] < exports.TRANSPARENT_LIMIT) {
        backgroundRGBA = (0, color_library_wrappers_1.colorToRgba)(fallbackBGColor);
    }
    if (foreground) {
        const foregroundRGBA = (0, color_library_wrappers_1.colorToRgba)(foreground);
        const blendedFgBg = (0, color_calcs_1.combineColors)(foregroundRGBA, backgroundRGBA);
        return (0, color_calcs_1.highContrastColor)(blendedFgBg, 'WCAG2', options);
    }
    return (0, color_calcs_1.highContrastColor)(backgroundRGBA);
}
exports.fillTextColor = fillTextColor;
function getResolvedBackgroundColor(fallbackBGColor, background = colors_1.Colors.Transparent.keyword) {
    let backgroundRGBA = (0, color_library_wrappers_1.colorToRgba)(background);
    if (backgroundRGBA[3] < exports.TRANSPARENT_LIMIT) {
        backgroundRGBA = (0, color_library_wrappers_1.colorToRgba)(fallbackBGColor);
    }
    return (0, color_library_wrappers_1.RGBATupleToString)(backgroundRGBA);
}
exports.getResolvedBackgroundColor = getResolvedBackgroundColor;
//# sourceMappingURL=fill_text_color.js.map