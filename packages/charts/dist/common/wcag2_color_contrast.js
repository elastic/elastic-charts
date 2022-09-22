"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWCAG2ContrastRatio = void 0;
function sRGBtoLin(colorChannel) {
    return colorChannel <= 0.03928 ? colorChannel / 12.92 : Math.pow((colorChannel + 0.055) / 1.055, 2.4);
}
function getLuminance(_a) {
    var _b = __read(_a, 3), r = _b[0], g = _b[1], b = _b[2];
    var vR = r / 255;
    var vG = g / 255;
    var vB = b / 255;
    return 0.2126 * sRGBtoLin(vR) + 0.7152 * sRGBtoLin(vG) + 0.0722 * sRGBtoLin(vB);
}
function getWCAG2ContrastRatio(foreground, background) {
    var lumA = getLuminance(foreground);
    var lumB = getLuminance(background);
    return lumA >= lumB ? (lumA + 0.05) / (lumB + 0.05) : (lumB + 0.05) / (lumA + 0.05);
}
exports.getWCAG2ContrastRatio = getWCAG2ContrastRatio;
//# sourceMappingURL=wcag2_color_contrast.js.map