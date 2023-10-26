"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maximiseFontSize = exports.fitText = exports.cutToLength = exports.measureOneBoxWidth = exports.HorizontalAlignment = exports.VerticalAlignments = exports.cssFontShorthand = exports.TEXT_BASELINE = exports.TEXT_ALIGNS = exports.FONT_STYLES = exports.FONT_VARIANTS = exports.FONT_WEIGHTS = void 0;
const monotonic_hill_climb_1 = require("../solvers/monotonic_hill_climb");
const FONT_WEIGHTS_NUMERIC = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const FONT_WEIGHTS_ALPHA = ['normal', 'bold', 'lighter', 'bolder', 'inherit', 'initial', 'unset'];
exports.FONT_WEIGHTS = Object.freeze([...FONT_WEIGHTS_NUMERIC, ...FONT_WEIGHTS_ALPHA]);
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
function cssFontShorthand({ fontStyle, fontVariant, fontWeight, fontFamily }, fontSize) {
    return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
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
    return s.length <= maxLength ? s : `${s.slice(0, Math.max(0, maxLength - 1))}…`;
}
exports.cutToLength = cutToLength;
function fitText(measure, desiredText, allottedWidth, fontSize, font) {
    const desiredLength = desiredText.length;
    const response = (v) => measure(desiredText.slice(0, Math.max(0, v)), font, fontSize).width;
    const visibleLength = (0, monotonic_hill_climb_1.monotonicHillClimb)(response, desiredLength, allottedWidth, monotonic_hill_climb_1.integerSnap);
    const text = visibleLength < 2 && desiredLength >= 2 ? '' : cutToLength(desiredText, visibleLength);
    const { width } = measure(text, font, fontSize);
    return { width, text };
}
exports.fitText = fitText;
function maximiseFontSize(measure, text, font, minFontSize, maxFontSize, boxWidth, boxHeight) {
    const response = (fontSize) => {
        const { width } = measure(text, font, fontSize);
        const widthDiff = boxWidth - width;
        const heightDiff = boxHeight - fontSize;
        return -Math.min(widthDiff, heightDiff);
    };
    return (0, monotonic_hill_climb_1.monotonicHillClimb)(response, maxFontSize, 0, monotonic_hill_climb_1.integerSnap, minFontSize);
}
exports.maximiseFontSize = maximiseFontSize;
//# sourceMappingURL=text_utils.js.map