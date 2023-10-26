"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapLines = exports.renderText = void 0;
const text_utils_1 = require("../../../../../common/text_utils");
const canvas_1 = require("../../../../../renderers/canvas");
const canvas_text_bbox_calculator_1 = require("../../../../../utils/bbox/canvas_text_bbox_calculator");
const common_1 = require("../../../../../utils/common");
function renderText(ctx, origin, text, font, angle = 0, translateX = 0, translateY = 0, scale = 1, direction) {
    (0, canvas_1.withContext)(ctx, () => {
        var _a;
        ctx.translate(origin.x, origin.y);
        ctx.rotate((0, common_1.degToRad)(angle));
        ctx.translate(translateX, translateY);
        ctx.scale(scale, scale);
        ctx.fillStyle = font.textColor;
        ctx.textAlign = font.align;
        ctx.textBaseline = font.baseline;
        ctx.font = (0, text_utils_1.cssFontShorthand)(font, font.fontSize);
        const shadowSize = (_a = font.shadowSize) !== null && _a !== void 0 ? _a : 0;
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
const SPACE = ' ';
const ELLIPSIS = '…';
const DASH = '-';
function wrapLines(ctx, text, font, fontSize, fixedWidth, fixedHeight, { wrapAtWord, shouldAddEllipsis } = { wrapAtWord: true, shouldAddEllipsis: false }) {
    const lineHeight = 1;
    const lines = text.split('\n');
    let textWidth = 0;
    const lineHeightPx = lineHeight * fontSize;
    const padding = 0;
    const maxWidth = Math.max(fixedWidth - padding * 2, 0);
    const maxHeightPx = Math.max(fixedHeight - padding * 2, 0);
    let currentHeightPx = 0;
    const shouldWrap = true;
    const textArr = [];
    const textMeasureProcessor = (0, canvas_text_bbox_calculator_1.measureText)(ctx);
    const getTextWidth = (textString) => {
        return textMeasureProcessor(textString, font, fontSize).width;
    };
    const additionalWidth = shouldAddEllipsis ? getTextWidth(ELLIPSIS) : 0;
    for (let i = 0, max = lines.length; i < max; ++i) {
        let line = lines[i];
        if (!line)
            continue;
        let lineWidth = getTextWidth(line);
        if (lineWidth > maxWidth) {
            while (line.length > 0) {
                let low = 0;
                let high = line.length;
                let match = '';
                let matchWidth = 0;
                while (low < high) {
                    const mid = (low + high) >>> 1;
                    const substr = line.slice(0, mid + 1);
                    const substrWidth = getTextWidth(substr) + additionalWidth;
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
                        const nextChar = line[match.length];
                        const nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
                        const wrapIndex = nextIsSpaceOrDash && matchWidth <= maxWidth
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