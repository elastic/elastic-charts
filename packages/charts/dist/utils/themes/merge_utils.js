"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeWithDefaultAnnotationRect = exports.mergeWithDefaultAnnotationLine = exports.DEFAULT_ANNOTATION_RECT_STYLE = exports.DEFAULT_ANNOTATION_LINE_STYLE = void 0;
const common_1 = require("../common");
exports.DEFAULT_ANNOTATION_LINE_STYLE = {
    line: {
        stroke: '#777',
        strokeWidth: 1,
        opacity: 1,
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
//# sourceMappingURL=merge_utils.js.map