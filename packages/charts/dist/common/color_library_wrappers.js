"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeColorLightness = exports.hslToColor = exports.colorToHsl = exports.colorToRgba = exports.getGreensColorScale = exports.getChromaColor = exports.isValid = exports.RGBATupleToString = exports.overrideOpacity = void 0;
const chroma_js_1 = __importDefault(require("chroma-js"));
const colors_1 = require("./colors");
const data_structures_1 = require("./data_structures");
const common_1 = require("../utils/common");
const logger_1 = require("../utils/logger");
function overrideOpacity([r, g, b, o], opacity) {
    const opacityOverride = opacity === undefined ? o : typeof opacity === 'number' ? opacity : opacity(o);
    if (r === 0 && b === 0 && g === 0 && o === 0) {
        return colors_1.Colors.Transparent.rgba;
    }
    return [r, g, b, (0, common_1.clamp)(Number.isFinite(opacityOverride) ? opacityOverride : o, 0, 1)];
}
exports.overrideOpacity = overrideOpacity;
function RGBATupleToString(rgba) {
    var _a;
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${(_a = rgba[3]) !== null && _a !== void 0 ? _a : 1})`;
}
exports.RGBATupleToString = RGBATupleToString;
function isValid(color) {
    try {
        return (0, chroma_js_1.default)(color === colors_1.Colors.Transparent.keyword ? 'rgba(0,0,0,0)' : color);
    }
    catch {
        return false;
    }
}
exports.isValid = isValid;
function getChromaColor(color) {
    return (0, chroma_js_1.default)(...color);
}
exports.getChromaColor = getChromaColor;
function getGreensColorScale(gamma, domain) {
    const scale = chroma_js_1.default.scale(chroma_js_1.default.brewer.Greens).gamma(gamma).domain(domain);
    return (value) => scale(value).css();
}
exports.getGreensColorScale = getGreensColorScale;
const rgbaCache = new data_structures_1.LRUCache(200);
function colorToRgba(color) {
    const cachedValue = rgbaCache.get(color);
    if (cachedValue === undefined) {
        const chromaColor = isValid(color);
        if (chromaColor === false)
            logger_1.Logger.warn(`The provided color is not a valid CSS color, using RED as fallback`, color);
        const newValue = chromaColor ? chromaColor.rgba() : colors_1.Colors.Red.rgba;
        rgbaCache.set(color, newValue);
        return newValue;
    }
    return cachedValue;
}
exports.colorToRgba = colorToRgba;
function colorToHsl(color) {
    const [r, g, b, a] = colorToRgba(color);
    const [h, s, l] = chroma_js_1.default.rgb(r, g, b).hsl();
    return [h, s, l, a];
}
exports.colorToHsl = colorToHsl;
function hslToColor(h, s, l, a = 1) {
    const rgba = chroma_js_1.default.hsl(h, s, l).alpha(a).rgba();
    return RGBATupleToString(rgba);
}
exports.hslToColor = hslToColor;
function changeColorLightness(color, lightnessAmount, lightnessThreshold) {
    const [h, s, l, a] = colorToHsl(color);
    return hslToColor(h, s, l >= lightnessThreshold ? l - lightnessAmount : l + lightnessAmount, a);
}
exports.changeColorLightness = changeColorLightness;
//# sourceMappingURL=color_library_wrappers.js.map