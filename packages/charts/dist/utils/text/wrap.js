"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapText = void 0;
const monotonic_hill_climb_1 = require("../../solvers/monotonic_hill_climb");
const ELLIPSIS = '…';
function wrapText(text, font, fontSize, maxLineWidth, maxLines, measure, locale) {
    var _a, _b, _c;
    if (maxLines <= 0) {
        return [];
    }
    const segmenter = textSegmenter(locale);
    const cleanedText = text.replaceAll('\n', ' ').replaceAll(/ +(?= )/g, '');
    const segments = Array.from(segmenter(cleanedText)).map((d) => ({
        ...d,
        width: measure(d.segment, font, fontSize).width,
    }));
    const ellipsisWidth = measure(ELLIPSIS, font, fontSize).width;
    const lines = [];
    let currentLineWidth = 0;
    for (const segment of segments) {
        if (currentLineWidth + segment.width > maxLineWidth && segment.segment.trimStart().length > 0) {
            const multilineText = breakLongTextIntoLines(segment.segment, font, fontSize, maxLineWidth, Infinity, measure);
            if (multilineText.length === 0) {
                break;
            }
            lines.push(...multilineText);
            currentLineWidth = multilineText.length > 0 ? measure((_a = multilineText.at(-1)) !== null && _a !== void 0 ? _a : '', font, fontSize).width : 0;
        }
        else {
            const lineIndex = lines.length > 0 ? lines.length - 1 : 0;
            lines[lineIndex] = ((_b = lines[lineIndex]) !== null && _b !== void 0 ? _b : '') + segment.segment;
            currentLineWidth += segment.width;
        }
    }
    if (lines.length > maxLines) {
        const lastLineMaxLineWidth = maxLineWidth - ellipsisWidth;
        const lastLine = clipTextToWidth((_c = lines[maxLines - 1]) !== null && _c !== void 0 ? _c : '', font, fontSize, lastLineMaxLineWidth, measure);
        if (lastLine.length > 0) {
            lines.splice(maxLines - 1, Infinity, `${lastLine}${ELLIPSIS}`);
        }
        else {
            if (lastLineMaxLineWidth > 0) {
                lines.splice(maxLines - 1, Infinity, ELLIPSIS);
            }
            else {
                lines.splice(maxLines, Infinity);
            }
        }
    }
    return lines;
}
exports.wrapText = wrapText;
function textSegmenter(locale) {
    if ('Segmenter' in Intl) {
        const fn = new Intl.Segmenter(locale, { granularity: 'word' });
        return (text) => Array.from(fn.segment(text));
    }
    else {
        return (text) => {
            return text
                .split(' ')
                .reduce((acc, segment, index, array) => {
                var _a, _b;
                const currentSegment = {
                    segment,
                    index: index === 0 ? 0 : ((_b = (_a = acc.at(-1)) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : 0) + 1,
                    isWordLike: true,
                };
                acc.push(currentSegment);
                if (index < array.length - 1) {
                    acc.push({ segment: ' ', index: currentSegment.index + segment.length, isWordLike: false });
                }
                return acc;
            }, []);
        };
    }
}
function breakLongTextIntoLines(text, font, fontSize, lineWidth, maxLines, measure) {
    const lines = [];
    let remainingText = text;
    while (maxLines > lines.length && remainingText.length > 0) {
        const lineClippedText = clipTextToWidth(remainingText, font, fontSize, lineWidth, measure);
        if (lineClippedText.length === 0) {
            break;
        }
        else {
            lines.push(lineClippedText.trimStart());
            remainingText = remainingText.slice(lineClippedText.length, Infinity);
        }
    }
    return lines;
}
function clipTextToWidth(text, font, fontSize, width, measure) {
    const maxCharsInLine = (0, monotonic_hill_climb_1.monotonicHillClimb)((chars) => measure(text.slice(0, chars), font, fontSize).width, text.length, width, (n) => Math.floor(n), 0);
    return text.slice(0, maxCharsInLine || 0);
}
//# sourceMappingURL=wrap.js.map