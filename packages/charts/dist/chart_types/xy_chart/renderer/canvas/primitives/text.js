"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapLines = exports.renderText = void 0;
var text_utils_1 = require("../../../../../common/text_utils");
var canvas_1 = require("../../../../../renderers/canvas");
var canvas_text_bbox_calculator_1 = require("../../../../../utils/bbox/canvas_text_bbox_calculator");
var common_1 = require("../../../../../utils/common");
function renderText(ctx, origin, text, font, angle, translateX, translateY, scale, direction) {
    if (angle === void 0) { angle = 0; }
    if (translateX === void 0) { translateX = 0; }
    if (translateY === void 0) { translateY = 0; }
    if (scale === void 0) { scale = 1; }
    (0, canvas_1.withContext)(ctx, function () {
        var _a;
        ctx.translate(origin.x, origin.y);
        ctx.rotate((0, common_1.degToRad)(angle));
        ctx.translate(translateX, translateY);
        ctx.scale(scale, scale);
        ctx.fillStyle = font.textColor;
        ctx.textAlign = font.align;
        ctx.textBaseline = font.baseline;
        ctx.font = (0, text_utils_1.cssFontShorthand)(font, font.fontSize);
        var shadowSize = (_a = font.shadowSize) !== null && _a !== void 0 ? _a : 0;
        if (direction)
            ctx.direction = direction;
        if (font.shadow && shadowSize > 0) {
            ctx.lineJoin = 'round';
            ctx.lineWidth = shadowSize;
            ctx.strokeStyle = font.shadow;
            ctx.strokeText(text, 0, 0);
        }
        ctx.fillText(text, 0, 0);
    });
}
exports.renderText = renderText;
var SPACE = ' ';
var ELLIPSIS = '…';
var DASH = '-';
function wrapLines(ctx, text, font, fontSize, fixedWidth, fixedHeight, _a) {
    var _b = _a === void 0 ? { wrapAtWord: true, shouldAddEllipsis: false } : _a, wrapAtWord = _b.wrapAtWord, shouldAddEllipsis = _b.shouldAddEllipsis;
    var lineHeight = 1;
    var lines = text.split('\n');
    var textWidth = 0;
    var lineHeightPx = lineHeight * fontSize;
    var padding = 0;
    var maxWidth = Math.max(fixedWidth - padding * 2, 0);
    var maxHeightPx = Math.max(fixedHeight - padding * 2, 0);
    var currentHeightPx = 0;
    var shouldWrap = true;
    var textArr = [];
    var textMeasureProcessor = (0, canvas_text_bbox_calculator_1.measureText)(ctx);
    var getTextWidth = function (textString) {
        return textMeasureProcessor(textString, font, fontSize).width;
    };
    var additionalWidth = shouldAddEllipsis ? getTextWidth(ELLIPSIS) : 0;
    for (var i = 0, max = lines.length; i < max; ++i) {
        var line = lines[i];
        var lineWidth = getTextWidth(line);
        if (lineWidth > maxWidth) {
            while (line.length > 0) {
                var low = 0;
                var high = line.length;
                var match = '';
                var matchWidth = 0;
                while (low < high) {
                    var mid = (low + high) >>> 1;
                    var substr = line.slice(0, mid + 1);
                    var substrWidth = getTextWidth(substr) + additionalWidth;
                    if (substrWidth <= maxWidth) {
                        low = mid + 1;
                        match = substr + (shouldAddEllipsis ? ELLIPSIS : '');
                        matchWidth = substrWidth;
                    }
                    else {
                        high = mid;
                    }
                }
                if (match) {
                    if (wrapAtWord) {
                        var nextChar = line[match.length];
                        var nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
                        var wrapIndex = nextIsSpaceOrDash && matchWidth <= maxWidth
                            ? match.length
                            : Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) + 1;
                        if (wrapIndex > 0) {
                            low = wrapIndex;
                            match = match.slice(0, low);
                            matchWidth = getTextWidth(match);
                        }
                    }
                    match = match.trimEnd();
                    textArr.push(match);
                    textWidth = Math.max(textWidth, matchWidth);
                    currentHeightPx += lineHeightPx;
                    if (!shouldWrap || (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)) {
                        break;
                    }
                    line = line.slice(low);
                    line = line.trimStart();
                    if (line.length > 0) {
                        lineWidth = getTextWidth(line);
                        if (lineWidth <= maxWidth) {
                            textArr.push(line);
                            currentHeightPx += lineHeightPx;
                            textWidth = Math.max(textWidth, lineWidth);
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }
        }
        else {
            textArr.push(line);
            currentHeightPx += lineHeightPx;
            textWidth = Math.max(textWidth, lineWidth);
        }
        if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
            break;
        }
    }
    return {
        lines: textArr,
        height: fontSize,
        width: textWidth,
    };
}
exports.wrapLines = wrapLines;
//# sourceMappingURL=text.js.map