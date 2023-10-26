"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureText = exports.withTextMeasure = void 0;
const text_utils_1 = require("../../common/text_utils");
const withTextMeasure = (fun) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return fun(ctx ? measureText(ctx) : () => ({ width: 0, height: 0 }));
};
exports.withTextMeasure = withTextMeasure;
function measureText(ctx) {
    return (text, font, fontSize, lineHeight = 1) => {
        if (text.length === 0) {
            return { width: 0, height: fontSize * lineHeight };
        }
        ctx.font = (0, text_utils_1.cssFontShorthand)(font, fontSize);
        const { width } = ctx.measureText(text);
        return { width, height: fontSize * lineHeight };
    };
}
exports.measureText = measureText;
//# sourceMappingURL=canvas_text_bbox_calculator.js.map