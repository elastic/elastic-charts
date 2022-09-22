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
exports.maximiseFontSize = exports.fitText = exports.cutToLength = exports.measureOneBoxWidth = exports.HorizontalAlignment = exports.VerticalAlignments = exports.cssFontShorthand = exports.TEXT_BASELINE = exports.TEXT_ALIGNS = exports.FONT_STYLES = exports.FONT_VARIANTS = exports.FONT_WEIGHTS = void 0;
var monotonic_hill_climb_1 = require("../solvers/monotonic_hill_climb");
var FONT_WEIGHTS_NUMERIC = [100, 200, 300, 400, 500, 600, 700, 800, 900];
var FONT_WEIGHTS_ALPHA = ['normal', 'bold', 'lighter', 'bolder', 'inherit', 'initial', 'unset'];
exports.FONT_WEIGHTS = Object.freeze(__spreadArray(__spreadArray([], __read(FONT_WEIGHTS_NUMERIC), false), __read(FONT_WEIGHTS_ALPHA), false));
exports.FONT_VARIANTS = Object.freeze(['normal', 'small-caps']);
exports.FONT_STYLES = Object.freeze(['normal', 'italic', 'oblique', 'inherit', 'initial', 'unset']);
exports.TEXT_ALIGNS = Object.freeze(['start', 'end', 'left', 'right', 'center']);
exports.TEXT_BASELINE = Object.freeze([
    'top',
    'hanging',
    'middle',
    'alphabetic',
    'ideographic',
    'bottom',
]);
function cssFontShorthand(_a, fontSize) {
    var fontStyle = _a.fontStyle, fontVariant = _a.fontVariant, fontWeight = _a.fontWeight, fontFamily = _a.fontFamily;
    return "".concat(fontStyle, " ").concat(fontVariant, " ").concat(fontWeight, " ").concat(fontSize, "px ").concat(fontFamily);
}
exports.cssFontShorthand = cssFontShorthand;
exports.VerticalAlignments = Object.freeze({
    top: 'top',
    middle: 'middle',
    bottom: 'bottom',
    alphabetic: 'alphabetic',
    hanging: 'hanging',
    ideographic: 'ideographic',
});
exports.HorizontalAlignment = Object.freeze({
    left: 'left',
    center: 'center',
    right: 'right',
});
function measureOneBoxWidth(measure, fontSize, box) {
    return measure(box.text, box, fontSize).width;
}
exports.measureOneBoxWidth = measureOneBoxWidth;
function cutToLength(s, maxLength) {
    return s.length <= maxLength ? s : "".concat(s.slice(0, Math.max(0, maxLength - 1)), "\u2026");
}
exports.cutToLength = cutToLength;
function fitText(measure, desiredText, allottedWidth, fontSize, font) {
    var desiredLength = desiredText.length;
    var response = function (v) { return measure(desiredText.slice(0, Math.max(0, v)), font, fontSize).width; };
    var visibleLength = (0, monotonic_hill_climb_1.monotonicHillClimb)(response, desiredLength, allottedWidth, monotonic_hill_climb_1.integerSnap);
    var text = visibleLength < 2 && desiredLength >= 2 ? '' : cutToLength(desiredText, visibleLength);
    var width = measure(text, font, fontSize).width;
    return { width: width, text: text };
}
exports.fitText = fitText;
function maximiseFontSize(measure, text, font, minFontSize, maxFontSize, boxWidth, boxHeight) {
    var response = function (fontSize) {
        var width = measure(text, font, fontSize).width;
        var widthDiff = boxWidth - width;
        var heightDiff = boxHeight - fontSize;
        return -Math.min(widthDiff, heightDiff);
    };
    return (0, monotonic_hill_climb_1.monotonicHillClimb)(response, maxFontSize, 0, monotonic_hill_climb_1.integerSnap, minFontSize);
}
exports.maximiseFontSize = maximiseFontSize;
//# sourceMappingURL=text_utils.js.map