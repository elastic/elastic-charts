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
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawRect = exports.drawCanvas2d = void 0;
var default_theme_attributes_1 = require("../../../common/default_theme_attributes");
var text_utils_1 = require("../../../common/text_utils");
var common_1 = require("./common");
var scale = function (value, from, to) { return (value - from) / (to - from); };
var formatter = function (label) { return label; };
var TEXT_PAD_LEFT = 4;
var TEXT_PAD_RIGHT = 4;
var MIN_TEXT_LENGTH = 0;
var ROW_OFFSET_Y = 0.45;
var MAX_FONT_HEIGHT_RATIO = 1;
var MAX_FONT_SIZE = 12;
var mix = function (a, b, x) { return (1 - x) * a + x * b; };
var drawCanvas2d = function (ctx, logicalTime, cssWidth, cssHeight, cssOffsetX, cssOffsetY, dpr, columnarGeomData, rowHeight, _a, color) {
    var _b = __read(_a, 4), focusLoX = _b[0], focusHiX = _b[1], focusLoY = _b[2], focusHiY = _b[3];
    var zoomedRowHeight = rowHeight / Math.abs(focusHiY - focusLoY);
    var rowHeightPx = zoomedRowHeight * cssHeight;
    var fontSize = Math.min(2.6 * Math.log2((zoomedRowHeight * cssHeight - common_1.BOX_GAP_VERTICAL) * MAX_FONT_HEIGHT_RATIO), MAX_FONT_SIZE);
    var minTextLengthCssPix = MIN_TEXT_LENGTH * fontSize;
    var minRectWidthForTextInCssPix = minTextLengthCssPix + TEXT_PAD_LEFT + TEXT_PAD_RIGHT;
    var minRectWidth = minRectWidthForTextInCssPix / cssWidth;
    var textColor = 'black';
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.scale(dpr, dpr);
    ctx.font = (0, text_utils_1.cssFontShorthand)({ fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY, fontStyle: 'normal', fontVariant: 'normal', fontWeight: 'normal' }, fontSize);
    ctx.clearRect(0, 0, (0, common_1.roundUpSize)(cssWidth + cssOffsetX), (0, common_1.roundUpSize)(cssHeight + cssOffsetY));
    ctx.translate(cssOffsetX, cssOffsetY);
    ctx.beginPath();
    ctx.rect(0, 0, (0, common_1.roundUpSize)(cssWidth), cssHeight);
    ctx.clip();
    var lastTextColor = '';
    var lastTextAlpha = 1;
    columnarGeomData.label.forEach(function (dataName, i) {
        var label = formatter(dataName);
        var size = mix(columnarGeomData.size0[i], columnarGeomData.size1[i], logicalTime);
        var scaledSize = size / (focusHiX - focusLoX);
        if (label && scaledSize >= minRectWidth) {
            var xNorm = mix(columnarGeomData.position0[2 * i], columnarGeomData.position1[2 * i], logicalTime);
            var yNorm = mix(columnarGeomData.position0[2 * i + 1], columnarGeomData.position1[2 * i + 1], logicalTime);
            if (xNorm + size < focusLoX || xNorm > focusHiX || yNorm + rowHeight < focusLoY || yNorm > focusHiY)
                return;
            var baseX = scale(xNorm, focusLoX, focusHiX) * cssWidth;
            var leftOutside = Math.max(0, -baseX);
            var x = baseX + leftOutside;
            var y = cssHeight * (1 - scale(yNorm, focusLoY, focusHiY));
            var baseWidth = scaledSize * cssWidth - common_1.BOX_GAP_HORIZONTAL - TEXT_PAD_RIGHT;
            var width = baseWidth - leftOutside;
            ctx.beginPath();
            var renderedWidth = Math.min(width, cssWidth - x);
            ctx.rect(x, y - zoomedRowHeight * cssHeight, renderedWidth, rowHeightPx);
            if (textColor !== lastTextColor) {
                ctx.fillStyle = textColor;
                lastTextColor = textColor;
            }
            var textAlpha = color[i * 4 + 3];
            if (textAlpha !== lastTextAlpha) {
                ctx.globalAlpha = textAlpha;
                lastTextAlpha = textAlpha;
            }
            ctx.save();
            ctx.clip();
            ctx.fillText(label, x + TEXT_PAD_LEFT, y - ROW_OFFSET_Y * zoomedRowHeight * cssHeight);
            ctx.restore();
        }
    });
    ctx.restore();
};
exports.drawCanvas2d = drawCanvas2d;
var drawRect = function (ctx, cssWidth, cssHeight, left, bottom, dpr, _a, fillColor, borderColor, borderLineWidth) {
    var _b = __read(_a, 4), focusLoX = _b[0], focusHiX = _b[1], focusLoY = _b[2], focusHiY = _b[3];
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.beginPath();
    var boxHeight = cssHeight * Math.abs(focusHiY - focusLoY);
    var x = left + cssWidth * focusLoX + borderLineWidth / 2;
    var y = bottom - boxHeight - focusLoY * cssHeight + borderLineWidth / 2;
    var width = Math.max(borderLineWidth, cssWidth * (focusHiX - focusLoX) - borderLineWidth);
    var height = Math.max(borderLineWidth, boxHeight - borderLineWidth);
    if (fillColor === 'transparent') {
        ctx.clearRect(x, y, width, height);
    }
    else {
        ctx.rect(x, y, width, height);
    }
    if (fillColor && fillColor !== 'transparent') {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (borderColor && borderLineWidth > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderLineWidth;
        ctx.stroke();
    }
    ctx.restore();
};
exports.drawRect = drawRect;
//# sourceMappingURL=draw_canvas.js.map