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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highContrastColor = exports.combineColors = exports.arrayToLookup = exports.hueInterpolator = void 0;
var apca_color_contrast_1 = require("./apca_color_contrast");
var color_library_wrappers_1 = require("./color_library_wrappers");
var colors_1 = require("./colors");
var wcag2_color_contrast_1 = require("./wcag2_color_contrast");
function hueInterpolator(colors) {
    return function (d) { return (0, color_library_wrappers_1.RGBATupleToString)(colors[Math.round(d * 255)]); };
}
exports.hueInterpolator = hueInterpolator;
function arrayToLookup(keyFun, array) {
    return Object.assign.apply(Object, __spreadArray([{}], __read(array.map(function (d) {
        var _a;
        return (_a = {}, _a[keyFun(d)] = d, _a);
    })), false));
}
exports.arrayToLookup = arrayToLookup;
function combineColors(_a, _b) {
    var _c = __read(_a, 4), fgR = _c[0], fgG = _c[1], fgB = _c[2], fgA = _c[3];
    var _d = __read(_b, 4), bgR = _d[0], bgG = _d[1], bgB = _d[2], bgA = _d[3];
    if (fgA === 1) {
        return [fgR, fgG, fgB, fgA];
    }
    var alpha = fgA + bgA * (1 - fgA);
    if (alpha === 0) {
        return colors_1.Colors.Transparent.rgba;
    }
    var r = Math.round((fgR * fgA + bgR * bgA * (1 - fgA)) / alpha);
    var g = Math.round((fgG * fgA + bgG * bgA * (1 - fgA)) / alpha);
    var b = Math.round((fgB * fgA + bgB * bgA * (1 - fgA)) / alpha);
    return [r, g, b, alpha];
}
exports.combineColors = combineColors;
function getHighContrastColorWCAG2(background) {
    var wWhite = (0, wcag2_color_contrast_1.getWCAG2ContrastRatio)(colors_1.Colors.White.rgba, background);
    var wBlack = (0, wcag2_color_contrast_1.getWCAG2ContrastRatio)(colors_1.Colors.Black.rgba, background);
    return wWhite >= wBlack ? colors_1.Colors.White.rgba : colors_1.Colors.Black.rgba;
}
function getHighContrastColorAPCA(background) {
    var wWhiteText = Math.abs((0, apca_color_contrast_1.APCAContrast)(background, colors_1.Colors.White.rgba));
    var wBlackText = Math.abs((0, apca_color_contrast_1.APCAContrast)(background, colors_1.Colors.Black.rgba));
    return wWhiteText > wBlackText ? colors_1.Colors.White.rgba : colors_1.Colors.Black.rgba;
}
var HIGH_CONTRAST_FN = {
    WCAG2: getHighContrastColorWCAG2,
    WCAG3: getHighContrastColorAPCA,
};
function highContrastColor(background, mode) {
    if (mode === void 0) { mode = 'WCAG2'; }
    return HIGH_CONTRAST_FN[mode](background);
}
exports.highContrastColor = highContrastColor;
//# sourceMappingURL=color_calcs.js.map