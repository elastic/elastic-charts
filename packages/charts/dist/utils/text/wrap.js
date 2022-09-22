"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
exports.wrapText = void 0;
var monotonic_hill_climb_1 = require("../../solvers/monotonic_hill_climb");
var ELLIPSIS = '…';
function wrapText(text, font, fontSize, maxLineWidth, maxLines, measure) {
    var e_1, _a;
    var _b;
    if (maxLines <= 0) {
        return [];
    }
    var segmenter = textSegmenter([]);
    var cleanedText = text.replace(/\n/g, ' ').replace(/ +(?= )/g, '');
    var segments = Array.from(segmenter(cleanedText)).map(function (d) { return (__assign(__assign({}, d), { width: measure(d.segment, font, fontSize).width })); });
    var ellipsisWidth = measure(ELLIPSIS, font, fontSize).width;
    var lines = [];
    var currentLineWidth = 0;
    try {
        for (var segments_1 = __values(segments), segments_1_1 = segments_1.next(); !segments_1_1.done; segments_1_1 = segments_1.next()) {
            var segment = segments_1_1.value;
            if (currentLineWidth + segment.width > maxLineWidth && segment.segment.trimStart().length > 0) {
                var multilineText = breakLongTextIntoLines(segment.segment, font, fontSize, maxLineWidth, Infinity, measure);
                if (multilineText.length === 0) {
                    break;
                }
                lines.push.apply(lines, __spreadArray([], __read(multilineText), false));
                currentLineWidth =
                    multilineText.length > 0 ? measure(multilineText[multilineText.length - 1], font, fontSize).width : 0;
            }
            else {
                var lineIndex = lines.length > 0 ? lines.length - 1 : 0;
                lines[lineIndex] = ((_b = lines[lineIndex]) !== null && _b !== void 0 ? _b : '') + segment.segment;
                currentLineWidth += segment.width;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (segments_1_1 && !segments_1_1.done && (_a = segments_1.return)) _a.call(segments_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (lines.length > maxLines) {
        var lastLineMaxLineWidth = maxLineWidth - ellipsisWidth;
        var lastLine = clipTextToWidth(lines[maxLines - 1], font, fontSize, lastLineMaxLineWidth, measure);
        if (lastLine.length > 0) {
            lines.splice(maxLines - 1, Infinity, "".concat(lastLine).concat(ELLIPSIS));
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
        var fn_1 = new Intl.Segmenter(locale, { granularity: 'word' });
        return function (text) { return Array.from(fn_1.segment(text)); };
    }
    else {
        return function (text) {
            return text
                .split(' ')
                .reduce(function (acc, segment, index, array) {
                var currentSegment = { segment: segment, index: index === 0 ? 0 : acc[acc.length - 1].index + 1, isWordLike: true };
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
    var lines = [];
    var remainingText = text;
    while (maxLines > lines.length && remainingText.length > 0) {
        var lineClippedText = clipTextToWidth(remainingText, font, fontSize, lineWidth, measure);
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
    var maxCharsInLine = (0, monotonic_hill_climb_1.monotonicHillClimb)(function (chars) { return measure(text.slice(0, chars), font, fontSize).width; }, text.length, width, function (n) { return Math.floor(n); }, 0);
    return text.slice(0, maxCharsInLine || 0);
}
//# sourceMappingURL=wrap.js.map