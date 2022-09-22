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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeColorLightness = exports.hslToColor = exports.colorToHsl = exports.colorToRgba = exports.getGreensColorScale = exports.getChromaColor = exports.isValid = exports.RGBATupleToString = exports.overrideOpacity = void 0;
var chroma_js_1 = __importDefault(require("chroma-js"));
var common_1 = require("../utils/common");
var logger_1 = require("../utils/logger");
var colors_1 = require("./colors");
var data_structures_1 = require("./data_structures");
function overrideOpacity(_a, opacity) {
    var _b = __read(_a, 4), r = _b[0], g = _b[1], b = _b[2], o = _b[3];
    var opacityOverride = opacity === undefined ? o : typeof opacity === 'number' ? opacity : opacity(o);
    if (r === 0 && b === 0 && g === 0 && o === 0) {
        return colors_1.Colors.Transparent.rgba;
    }
    return [r, g, b, (0, common_1.clamp)(Number.isFinite(opacityOverride) ? opacityOverride : o, 0, 1)];
}
exports.overrideOpacity = overrideOpacity;
function RGBATupleToString(rgba) {
    var _a;
    return "rgba(".concat(rgba[0], ", ").concat(rgba[1], ", ").concat(rgba[2], ", ").concat((_a = rgba[3]) !== null && _a !== void 0 ? _a : 1, ")");
}
exports.RGBATupleToString = RGBATupleToString;
function isValid(color) {
    try {
        return (0, chroma_js_1.default)(color === colors_1.Colors.Transparent.keyword ? 'rgba(0,0,0,0)' : color);
    }
    catch (_a) {
        return false;
    }
}
exports.isValid = isValid;
function getChromaColor(color) {
    return chroma_js_1.default.apply(void 0, __spreadArray([], __read(color), false));
}
exports.getChromaColor = getChromaColor;
function getGreensColorScale(gamma, domain) {
    var scale = chroma_js_1.default.scale(chroma_js_1.default.brewer.Greens).gamma(gamma).domain(domain);
    return function (value) { return scale(value).css(); };
}
exports.getGreensColorScale = getGreensColorScale;
var rgbaCache = new data_structures_1.LRUCache(200);
function colorToRgba(color) {
    var cachedValue = rgbaCache.get(color);
    if (cachedValue === undefined) {
        var chromaColor = isValid(color);
        if (chromaColor === false)
            logger_1.Logger.warn("The provided color is not a valid CSS color, using RED as fallback", color);
        var newValue = chromaColor ? chromaColor.rgba() : colors_1.Colors.Red.rgba;
        rgbaCache.set(color, newValue);
        return newValue;
    }
    return cachedValue;
}
exports.colorToRgba = colorToRgba;
function colorToHsl(color) {
    var _a = __read(colorToRgba(color), 3), r = _a[0], g = _a[1], b = _a[2];
    return chroma_js_1.default.rgb(r, g, b).hsl();
}
exports.colorToHsl = colorToHsl;
function hslToColor(h, s, l) {
    var rgba = chroma_js_1.default.hsl(h, s, l).rgba();
    return RGBATupleToString(rgba);
}
exports.hslToColor = hslToColor;
function changeColorLightness(color, lightnessAmount, lightnessThreshold) {
    var _a = __read(colorToHsl(color), 3), h = _a[0], s = _a[1], l = _a[2];
    return hslToColor(h, s, l >= lightnessThreshold ? l - lightnessAmount : l + lightnessAmount);
}
exports.changeColorLightness = changeColorLightness;
//# sourceMappingURL=color_library_wrappers.js.map