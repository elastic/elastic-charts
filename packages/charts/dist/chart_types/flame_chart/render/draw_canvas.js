"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawRect = exports.drawCanvas2d = void 0;
const common_1 = require("./common");
const default_theme_attributes_1 = require("../../../common/default_theme_attributes");
const text_utils_1 = require("../../../common/text_utils");
const scale = (value, from, to) => (value - from) / (to - from);
const formatter = (label) => label;
const TEXT_PAD_LEFT = 4;
const TEXT_PAD_RIGHT = 4;
const MIN_TEXT_LENGTH = 0;
const ROW_OFFSET_Y = 0.45;
const MAX_FONT_HEIGHT_RATIO = 1;
const MAX_FONT_SIZE = 12;
const mix = (a = 1, b = 1, x = 1) => (1 - x) * a + x * b;
const drawCanvas2d = (ctx, logicalTime, cssWidth, cssHeight, cssOffsetX, cssOffsetY, dpr, columnarGeomData, rowHeight, [focusLoX, focusHiX, focusLoY, focusHiY], color) => {
    const zoomedRowHeight = rowHeight / Math.abs(focusHiY - focusLoY);
    const rowHeightPx = zoomedRowHeight * cssHeight;
    const fontSize = Math.min(2.6 * Math.log2((zoomedRowHeight * cssHeight - common_1.BOX_GAP_VERTICAL) * MAX_FONT_HEIGHT_RATIO), MAX_FONT_SIZE);
    const minTextLengthCssPix = MIN_TEXT_LENGTH * fontSize;
    const minRectWidthForTextInCssPix = minTextLengthCssPix + TEXT_PAD_LEFT + TEXT_PAD_RIGHT;
    const minRectWidth = minRectWidthForTextInCssPix / cssWidth;
    const textColor = 'black';
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
    let lastTextColor = '';
    let lastTextAlpha = 1;
    columnarGeomData.label.forEach((dataName, i) => {
        var _a;
        const label = formatter(dataName);
        const size = mix(columnarGeomData.size0[i], columnarGeomData.size1[i], logicalTime);
        const scaledSize = size / (focusHiX - focusLoX);
        if (label && scaledSize >= minRectWidth) {
            const xNorm = mix(columnarGeomData.position0[2 * i], columnarGeomData.position1[2 * i], logicalTime);
            const yNorm = mix(columnarGeomData.position0[2 * i + 1], columnarGeomData.position1[2 * i + 1], logicalTime);
            if (xNorm + size < focusLoX || xNorm > focusHiX || yNorm + rowHeight < focusLoY || yNorm > focusHiY)
                return;
            const baseX = scale(xNorm, focusLoX, focusHiX) * cssWidth;
            const leftOutside = Math.max(0, -baseX);
            const x = baseX + leftOutside;
            const y = cssHeight * (1 - scale(yNorm, focusLoY, focusHiY));
            const baseWidth = scaledSize * cssWidth - common_1.BOX_GAP_HORIZONTAL - TEXT_PAD_RIGHT;
            const width = baseWidth - leftOutside;
            ctx.beginPath();
            const renderedWidth = Math.min(width, cssWidth - x);
            ctx.rect(x, y - zoomedRowHeight * cssHeight, renderedWidth, rowHeightPx);
            if (textColor !== lastTextColor) {
                ctx.fillStyle = textColor;
                lastTextColor = textColor;
            }
            const textAlpha = (_a = color[i * 4 + 3]) !== null && _a !== void 0 ? _a : 1;
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
const drawRect = (ctx, cssWidth, cssHeight, left, bottom, dpr, [focusLoX, focusHiX, focusLoY, focusHiY], fillColor, borderColor, borderLineWidth) => {
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.beginPath();
    const boxHeight = cssHeight * Math.abs(focusHiY - focusLoY);
    const x = left + cssWidth * focusLoX + borderLineWidth / 2;
    const y = bottom - boxHeight - focusLoY * cssHeight + borderLineWidth / 2;
    const width = Math.max(borderLineWidth, cssWidth * (focusHiX - focusLoX) - borderLineWidth);
    const height = Math.max(borderLineWidth, boxHeight - borderLineWidth);
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