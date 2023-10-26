"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWCAG2ContrastRatio = void 0;
function sRGBtoLin(colorChannel) {
    return colorChannel <= 0.03928 ? colorChannel / 12.92 : Math.pow((colorChannel + 0.055) / 1.055, 2.4);
}
function getLuminance([r, g, b]) {
    const vR = r / 255;
    const vG = g / 255;
    const vB = b / 255;
    return 0.2126 * sRGBtoLin(vR) + 0.7152 * sRGBtoLin(vG) + 0.0722 * sRGBtoLin(vB);
}
function getWCAG2ContrastRatio(foreground, background) {
    const lumA = getLuminance(foreground);
    const lumB = getLuminance(background);
    return lumA >= lumB ? (lumA + 0.05) / (lumB + 0.05) : (lumB + 0.05) / (lumA + 0.05);
}
exports.getWCAG2ContrastRatio = getWCAG2ContrastRatio;
//# sourceMappingURL=wcag2_color_contrast.js.map