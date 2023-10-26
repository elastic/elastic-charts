"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highContrastColor = exports.combineColors = exports.arrayToLookup = exports.hueInterpolator = void 0;
const apca_color_contrast_1 = require("./apca_color_contrast");
const color_library_wrappers_1 = require("./color_library_wrappers");
const colors_1 = require("./colors");
const wcag2_color_contrast_1 = require("./wcag2_color_contrast");
function hueInterpolator(colors) {
    return (d) => { var _a; return (0, color_library_wrappers_1.RGBATupleToString)((_a = colors[Math.round(d * 255)]) !== null && _a !== void 0 ? _a : colors_1.Colors.White.rgba); };
}
exports.hueInterpolator = hueInterpolator;
function arrayToLookup(keyFun, array) {
    return Object.assign({}, ...array.map((d) => ({ [keyFun(d)]: d })));
}
exports.arrayToLookup = arrayToLookup;
function combineColors([fgR, fgG, fgB, fgA], [bgR, bgG, bgB, bgA]) {
    if (fgA === 1) {
        return [fgR, fgG, fgB, fgA];
    }
    const alpha = fgA + bgA * (1 - fgA);
    if (alpha === 0) {
        return colors_1.Colors.Transparent.rgba;
    }
    const r = Math.round((fgR * fgA + bgR * bgA * (1 - fgA)) / alpha);
    const g = Math.round((fgG * fgA + bgG * bgA * (1 - fgA)) / alpha);
    const b = Math.round((fgB * fgA + bgB * bgA * (1 - fgA)) / alpha);
    return [r, g, b, alpha];
}
exports.combineColors = combineColors;
const getOptionWithDefaults = (options = {}) => ({
    darkColor: colors_1.Colors.Black.rgba,
    lightColor: colors_1.Colors.White.rgba,
    ...options,
});
function getHighContrastColorWCAG2(background, options = {}) {
    const { lightColor, darkColor } = getOptionWithDefaults(options);
    const wLight = (0, wcag2_color_contrast_1.getWCAG2ContrastRatio)(lightColor, background);
    const wDark = (0, wcag2_color_contrast_1.getWCAG2ContrastRatio)(darkColor, background);
    return wLight >= wDark
        ? {
            color: {
                rgba: lightColor,
                keyword: (0, color_library_wrappers_1.RGBATupleToString)(lightColor),
            },
            ratio: wLight,
            shade: 'light',
        }
        : {
            color: {
                rgba: darkColor,
                keyword: (0, color_library_wrappers_1.RGBATupleToString)(darkColor),
            },
            ratio: wDark,
            shade: 'dark',
        };
}
function getHighContrastColorAPCA(background, options = {}) {
    const { lightColor, darkColor } = getOptionWithDefaults(options);
    const wLightText = Math.abs((0, apca_color_contrast_1.APCAContrast)(background, lightColor));
    const wDarkText = Math.abs((0, apca_color_contrast_1.APCAContrast)(background, darkColor));
    return wLightText > wDarkText
        ? {
            color: {
                rgba: lightColor,
                keyword: (0, color_library_wrappers_1.RGBATupleToString)(lightColor),
            },
            ratio: wLightText,
            shade: 'light',
        }
        : {
            color: {
                rgba: darkColor,
                keyword: (0, color_library_wrappers_1.RGBATupleToString)(darkColor),
            },
            ratio: wDarkText,
            shade: 'dark',
        };
}
const HIGH_CONTRAST_FN = {
    WCAG2: getHighContrastColorWCAG2,
    WCAG3: getHighContrastColorAPCA,
};
function highContrastColor(background, mode = 'WCAG2', options) {
    return HIGH_CONTRAST_FN[mode](background, options);
}
exports.highContrastColor = highContrastColor;
//# sourceMappingURL=color_calcs.js.map