"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeWithDefaultTheme = exports.mergeWithDefaultAnnotationRect = exports.mergeWithDefaultAnnotationLine = exports.DEFAULT_ANNOTATION_RECT_STYLE = exports.DEFAULT_ANNOTATION_LINE_STYLE = void 0;
var common_1 = require("../common");
var light_theme_1 = require("./light_theme");
exports.DEFAULT_ANNOTATION_LINE_STYLE = {
    line: {
        stroke: '#777',
        strokeWidth: 1,
        opacity: 1,
    },
    details: {
        fontSize: 10,
        fontFamily: 'sans-serif',
        fontStyle: 'normal',
        fill: '#777',
        padding: 0,
    },
};
exports.DEFAULT_ANNOTATION_RECT_STYLE = {
    stroke: '#FFEEBC',
    strokeWidth: 0,
    opacity: 0.25,
    fill: '#FFEEBC',
};
function mergeWithDefaultAnnotationLine(config) {
    return (0, common_1.mergePartial)(exports.DEFAULT_ANNOTATION_LINE_STYLE, config);
}
exports.mergeWithDefaultAnnotationLine = mergeWithDefaultAnnotationLine;
function mergeWithDefaultAnnotationRect(config) {
    return (0, common_1.mergePartial)(exports.DEFAULT_ANNOTATION_RECT_STYLE, config);
}
exports.mergeWithDefaultAnnotationRect = mergeWithDefaultAnnotationRect;
function mergeWithDefaultTheme(theme, defaultTheme, auxiliaryThemes) {
    if (defaultTheme === void 0) { defaultTheme = light_theme_1.LIGHT_THEME; }
    if (auxiliaryThemes === void 0) { auxiliaryThemes = []; }
    return (0, common_1.mergePartial)(defaultTheme, theme, {}, auxiliaryThemes);
}
exports.mergeWithDefaultTheme = mergeWithDefaultTheme;
//# sourceMappingURL=merge_utils.js.map