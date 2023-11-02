"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPartitionCanvas2d = void 0;
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const constants_1 = require("../../../../common/constants");
const text_utils_1 = require("../../../../common/text_utils");
const canvas_1 = require("../../../../renderers/canvas");
const line_1 = require("../../../xy_chart/renderer/canvas/primitives/line");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
const LINE_WIDTH_MULT = 10;
const TAPER_OFF_LIMIT = 50;
const getCurrentRowX = (row, horizontalAlignment, rotation) => {
    const rowLength = Math.cos(rotation) * row.length;
    const offset = horizontalAlignment === text_utils_1.HorizontalAlignment.left
        ? -row.maximumLength / 2
        : horizontalAlignment === text_utils_1.HorizontalAlignment.right
            ? row.maximumLength / 2 - rowLength
            : -rowLength / 2;
    return row.rowAnchorX + offset;
};
const getFillTextXOffset = (box, rowLength, isRTL) => {
    return isRTL ? rowLength - box.width / 2 - box.wordBeginning : box.width / 2 + box.wordBeginning;
};
function renderTextRow(ctx, { fontSize, fillTextColor, rotation, verticalAlignment, horizontalAlignment, container, clipText, isRTL }, linkLabelTextColor) {
    return (currentRow) => {
        const crx = getCurrentRowX(currentRow, horizontalAlignment, rotation);
        const cry = -currentRow.rowAnchorY + (Math.sin(rotation) * currentRow.length) / 2;
        if (!Number.isFinite(crx) || !Number.isFinite(cry)) {
            return;
        }
        (0, canvas_1.withContext)(ctx, () => {
            ctx.scale(1, -1);
            if (clipText) {
                ctx.rect(container.x0 + 1, container.y0 + 1, container.x1 - container.x0 - 2, container.y1 - container.y0 - 2);
                ctx.clip();
            }
            ctx.beginPath();
            ctx.translate(crx, cry);
            ctx.rotate(-rotation);
            ctx.fillStyle = fillTextColor !== null && fillTextColor !== void 0 ? fillTextColor : linkLabelTextColor;
            ctx.textBaseline = verticalAlignment;
            ctx.direction = isRTL ? 'rtl' : 'ltr';
            currentRow.rowWords.forEach((box) => {
                if (box.isValue)
                    ctx.direction = 'ltr';
                ctx.font = (0, text_utils_1.cssFontShorthand)(box, fontSize);
                ctx.fillText(box.text, getFillTextXOffset(box, currentRow.length, isRTL), 0);
            });
            ctx.closePath();
        });
    };
}
function renderTextRows(ctx, rowSet, linkLabelTextColor) {
    rowSet.rows.forEach(renderTextRow(ctx, rowSet, linkLabelTextColor));
}
function renderRowSets(ctx, rowSets, linkLabelTextColor) {
    rowSets.forEach((rowSet) => renderTextRows(ctx, rowSet, linkLabelTextColor));
}
function renderTaperedBorder(ctx, { strokeWidth, strokeStyle, fillColor, x0, x1, y0px, y1px }) {
    const X0 = x0 - constants_1.TAU / 4;
    const X1 = x1 - constants_1.TAU / 4;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(0, 0, y0px, X0, X0);
    ctx.arc(0, 0, y1px, X0, X1, false);
    ctx.arc(0, 0, y0px, X1, X0, true);
    ctx.fill();
    if (strokeWidth > 0.001 && !(x0 === 0 && x1 === constants_1.TAU)) {
        ctx.lineWidth = strokeWidth;
        const tapered = x1 - x0 < (15 * constants_1.TAU) / 360;
        if (tapered) {
            ctx.beginPath();
            ctx.arc(0, 0, y1px, X0, X1, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, y0px, X1, X0, true);
            ctx.stroke();
            ctx.fillStyle = strokeStyle;
            ctx.beginPath();
            const yThreshold = Math.max(TAPER_OFF_LIMIT, (LINE_WIDTH_MULT * strokeWidth) / (X1 - X0));
            const beta = strokeWidth / yThreshold;
            ctx.arc(0, 0, y0px, X0, X0 + beta * (yThreshold / y0px));
            ctx.arc(0, 0, Math.min(yThreshold, y1px), X0 + beta, X0 + beta);
            ctx.arc(0, 0, y1px, X0 + beta * (yThreshold / y1px), X0, true);
            ctx.arc(0, 0, y0px, X0, X0);
            ctx.fill();
        }
        else {
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
        }
    }
}
function renderSectors(ctx, quadViewModel) {
    (0, canvas_1.withContext)(ctx, () => {
        ctx.scale(1, -1);
        quadViewModel.forEach((quad) => {
            if (quad.x0 !== quad.x1)
                renderTaperedBorder(ctx, quad);
        });
    });
}
function renderRectangles(ctx, quadViewModel) {
    (0, canvas_1.withContext)(ctx, () => {
        ctx.scale(1, -1);
        quadViewModel.forEach(({ strokeWidth, fillColor, x0, x1, y0px, y1px }) => {
            if (x1 - x0 >= 1 && y1px - y0px >= 1) {
                ctx.fillStyle = fillColor;
                ctx.beginPath();
                ctx.moveTo(x0, y0px);
                ctx.lineTo(x0, y1px);
                ctx.lineTo(x1, y1px);
                ctx.lineTo(x1, y0px);
                ctx.lineTo(x0, y0px);
                ctx.fill();
                if (strokeWidth > line_1.MIN_STROKE_WIDTH) {
                    ctx.lineWidth = strokeWidth;
                    ctx.stroke();
                }
            }
        });
    });
}
function renderFillOutsideLinks(ctx, outsideLinksViewModel, linkLabelTextColor, linkLabelLineWidth) {
    (0, canvas_1.withContext)(ctx, () => {
        ctx.lineWidth = linkLabelLineWidth;
        ctx.strokeStyle = linkLabelTextColor;
        outsideLinksViewModel.forEach(({ points }) => {
            ctx.beginPath();
            points.forEach(([x, y], index) => {
                return index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
        });
    });
}
function getLinkTextXOffset({ textAlign, width, valueWidth, isRTL }, labelValueGap) {
    const isRightAligned = textAlign === text_utils_1.HorizontalAlignment.right;
    const multiplier = isRightAligned ? -1 : 1;
    const isAligned = isRightAligned === isRTL;
    const to = multiplier * (labelValueGap + (isAligned ? width : valueWidth));
    return isAligned ? [0, to] : [to, 0];
}
function renderLinkLabels(ctx, linkLabelFontSize, linkLabelLineWidth, { linkLabels: allLinkLabels, labelFontSpec, valueFontSpec, strokeColor }, linkLineColor) {
    const labelColor = (0, color_library_wrappers_1.RGBATupleToString)((0, color_library_wrappers_1.colorToRgba)(labelFontSpec.textColor));
    const valueColor = (0, color_library_wrappers_1.RGBATupleToString)((0, color_library_wrappers_1.colorToRgba)(valueFontSpec.textColor));
    const labelValueGap = linkLabelFontSize / 2;
    (0, canvas_1.withContext)(ctx, () => {
        ctx.lineWidth = linkLabelLineWidth;
        allLinkLabels.forEach(({ linkLabels, translate, textAlign, text, valueText, width, valueWidth, isRTL }) => {
            ctx.beginPath();
            ctx.moveTo(...linkLabels[0]);
            linkLabels.slice(1).forEach((point) => ctx.lineTo(...point));
            ctx.strokeStyle = strokeColor !== null && strokeColor !== void 0 ? strokeColor : linkLineColor;
            ctx.stroke();
            const [labelX, valueX] = getLinkTextXOffset({ textAlign, width, valueWidth, isRTL }, labelValueGap);
            (0, canvas_1.withContext)(ctx, () => {
                ctx.translate(...translate);
                ctx.scale(1, -1);
                ctx.textAlign = textAlign;
                ctx.fillStyle = labelColor;
                ctx.font = (0, text_utils_1.cssFontShorthand)(labelFontSpec, linkLabelFontSize);
                ctx.direction = isRTL ? 'rtl' : 'ltr';
                ctx.fillText(text, labelX, 0);
                ctx.fillStyle = valueColor;
                ctx.font = (0, text_utils_1.cssFontShorthand)(valueFontSpec, linkLabelFontSize);
                ctx.direction = 'ltr';
                ctx.fillText(valueText, valueX, 0);
            });
        });
    });
}
const midlineOffset = 0.35;
function renderPartitionCanvas2d(ctx, dpr, { layout, width, height, style, quadViewModel, rowSets, outsideLinksViewModel, linkLabelViewModels, diskCenter, outerRadius, panel, chartDimensions, }) {
    const { sectorLineWidth, sectorLineStroke, linkLabel } = style;
    const linkLineColor = linkLabelViewModels.strokeColor;
    (0, canvas_1.withContext)(ctx, () => {
        ctx.scale(dpr, dpr);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = (0, text_utils_1.cssFontShorthand)(panel.fontFace, panel.fontSize);
        ctx.fillStyle = panel.fontFace.textColor;
        const innerPad = midlineOffset * panel.fontSize;
        ctx.fillText(panel.title, (0, viewmodel_1.isSunburst)(layout) ? diskCenter.x : diskCenter.x + (chartDimensions.width * width) / 2, (0, viewmodel_1.isSunburst)(layout)
            ? style.linkLabel.maxCount > 0
                ? diskCenter.y - (chartDimensions.height * height) / 2 + panel.fontSize
                : diskCenter.y - outerRadius - innerPad
            : diskCenter.y + 12);
        ctx.textBaseline = 'middle';
        ctx.translate(diskCenter.x, diskCenter.y);
        ctx.scale(1, -1);
        ctx.lineJoin = 'round';
        ctx.strokeStyle = sectorLineStroke;
        ctx.lineWidth = sectorLineWidth;
        (0, canvas_1.renderLayers)(ctx, [
            () => ((0, viewmodel_1.isSunburst)(layout) ? renderSectors(ctx, quadViewModel) : renderRectangles(ctx, quadViewModel)),
            () => renderRowSets(ctx, rowSets, linkLineColor),
            () => renderFillOutsideLinks(ctx, outsideLinksViewModel, linkLineColor, linkLabel.lineWidth),
            () => renderLinkLabels(ctx, linkLabel.fontSize, linkLabel.lineWidth, linkLabelViewModels, linkLineColor),
        ]);
    });
}
exports.renderPartitionCanvas2d = renderPartitionCanvas2d;
//# sourceMappingURL=canvas_renderers.js.map