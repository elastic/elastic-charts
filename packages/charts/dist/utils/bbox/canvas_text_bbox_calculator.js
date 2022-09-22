"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureText = exports.withTextMeasure = void 0;
var text_utils_1 = require("../../common/text_utils");
var withTextMeasure = function (fun) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    return fun(ctx ? measureText(ctx) : function () { return ({ width: 0, height: 0 }); });
};
exports.withTextMeasure = withTextMeasure;
function measureText(ctx) {
    return function (text, font, fontSize, lineHeight) {
        if (lineHeight === void 0) { lineHeight = 1; }
        if (text.length === 0) {
            return { width: 0, height: fontSize * lineHeight };
        }
        ctx.font = (0, text_utils_1.cssFontShorthand)(font, fontSize);
        var width = ctx.measureText(text).width;
        return { width: width, height: fontSize * lineHeight };
    };
}
exports.measureText = measureText;
//# sourceMappingURL=canvas_text_bbox_calculator.js.map