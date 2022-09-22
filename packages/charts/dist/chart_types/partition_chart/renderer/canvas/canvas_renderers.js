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
exports.renderPartitionCanvas2d = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var constants_1 = require("../../../../common/constants");
var text_utils_1 = require("../../../../common/text_utils");
var canvas_1 = require("../../../../renderers/canvas");
var line_1 = require("../../../xy_chart/renderer/canvas/primitives/line");
var viewmodel_1 = require("../../layout/viewmodel/viewmodel");
var LINE_WIDTH_MULT = 10;
var TAPER_OFF_LIMIT = 50;
var getCurrentRowX = function (row, horizontalAlignment, rotation) {
    var rowLength = Math.cos(rotation) * row.length;
    var offset = horizontalAlignment === text_utils_1.HorizontalAlignment.left
        ? -row.maximumLength / 2
        : horizontalAlignment === text_utils_1.HorizontalAlignment.right
            ? row.maximumLength / 2 - rowLength
            : -rowLength / 2;
    return row.rowAnchorX + offset;
};
var getFillTextXOffset = function (box, rowLength, isRTL) {
    return isRTL ? rowLength - box.width / 2 - box.wordBeginning : box.width / 2 + box.wordBeginning;
};
function renderTextRow(ctx, _a, linkLabelTextColor) {
    var fontSize = _a.fontSize, fillTextColor = _a.fillTextColor, rotation = _a.rotation, verticalAlignment = _a.verticalAlignment, horizontalAlignment = _a.horizontalAlignment, container = _a.container, clipText = _a.clipText, isRTL = _a.isRTL;
    return function (currentRow) {
        var crx = getCurrentRowX(currentRow, horizontalAlignment, rotation);
        var cry = -currentRow.rowAnchorY + (Math.sin(rotation) * currentRow.length) / 2;
        if (!Number.isFinite(crx) || !Number.isFinite(cry)) {
            return;
        }
        (0, canvas_1.withContext)(ctx, function () {
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
            currentRow.rowWords.forEach(function (box) {
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
    rowSets.forEach(function (rowSet) { return renderTextRows(ctx, rowSet, linkLabelTextColor); });
}
function renderTaperedBorder(ctx, _a) {
    var strokeWidth = _a.strokeWidth, strokeStyle = _a.strokeStyle, fillColor = _a.fillColor, x0 = _a.x0, x1 = _a.x1, y0px = _a.y0px, y1px = _a.y1px;
    var X0 = x0 - constants_1.TAU / 4;
    var X1 = x1 - constants_1.TAU / 4;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(0, 0, y0px, X0, X0);
    ctx.arc(0, 0, y1px, X0, X1, false);
    ctx.arc(0, 0, y0px, X1, X0, true);
    ctx.fill();
    if (strokeWidth > 0.001 && !(x0 === 0 && x1 === constants_1.TAU)) {
        ctx.lineWidth = strokeWidth;
        var tapered = x1 - x0 < (15 * constants_1.TAU) / 360;
        if (tapered) {
            ctx.beginPath();
            ctx.arc(0, 0, y1px, X0, X1, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, y0px, X1, X0, true);
            ctx.stroke();
            ctx.fillStyle = strokeStyle;
            ctx.beginPath();
            var yThreshold = Math.max(TAPER_OFF_LIMIT, (LINE_WIDTH_MULT * strokeWidth) / (X1 - X0));
            var beta = strokeWidth / yThreshold;
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
    (0, canvas_1.withContext)(ctx, function () {
        ctx.scale(1, -1);
        quadViewModel.forEach(function (quad) {
            if (quad.x0 !== quad.x1)
                renderTaperedBorder(ctx, quad);
        });
    });
}
function renderRectangles(ctx, quadViewModel) {
    (0, canvas_1.withContext)(ctx, function () {
        ctx.scale(1, -1);
        quadViewModel.forEach(function (_a) {
            var strokeWidth = _a.strokeWidth, fillColor = _a.fillColor, x0 = _a.x0, x1 = _a.x1, y0px = _a.y0px, y1px = _a.y1px;
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
    (0, canvas_1.withContext)(ctx, function () {
        ctx.lineWidth = linkLabelLineWidth;
        ctx.strokeStyle = linkLabelTextColor;
        outsideLinksViewModel.forEach(function (_a) {
            var points = _a.points;
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
            ctx.stroke();
        });
    });
}
function getLinkTextXOffset(_a, labelValueGap) {
    var textAlign = _a.textAlign, width = _a.width, valueWidth = _a.valueWidth, isRTL = _a.isRTL;
    var isRightAligned = textAlign === text_utils_1.HorizontalAlignment.right;
    var multiplier = isRightAligned ? -1 : 1;
    var isAligned = isRightAligned === isRTL;
    var to = multiplier * (labelValueGap + (isAligned ? width : valueWidth));
    return isAligned ? [0, to] : [to, 0];
}
function renderLinkLabels(ctx, linkLabelFontSize, linkLabelLineWidth, _a, linkLineColor) {
    var allLinkLabels = _a.linkLabels, labelFontSpec = _a.labelFontSpec, valueFontSpec = _a.valueFontSpec, strokeColor = _a.strokeColor;
    var labelColor = (0, color_library_wrappers_1.RGBATupleToString)((0, color_library_wrappers_1.colorToRgba)(labelFontSpec.textColor));
    var valueColor = (0, color_library_wrappers_1.RGBATupleToString)((0, color_library_wrappers_1.colorToRgba)(valueFontSpec.textColor));
    var labelValueGap = linkLabelFontSize / 2;
    (0, canvas_1.withContext)(ctx, function () {
        ctx.lineWidth = linkLabelLineWidth;
        allLinkLabels.forEach(function (_a) {
            var linkLabels = _a.linkLabels, translate = _a.translate, textAlign = _a.textAlign, text = _a.text, valueText = _a.valueText, width = _a.width, valueWidth = _a.valueWidth, isRTL = _a.isRTL;
            ctx.beginPath();
            ctx.moveTo.apply(ctx, __spreadArray([], __read(linkLabels[0]), false));
            linkLabels.slice(1).forEach(function (point) { return ctx.lineTo.apply(ctx, __spreadArray([], __read(point), false)); });
            ctx.strokeStyle = strokeColor !== null && strokeColor !== void 0 ? strokeColor : linkLineColor;
            ctx.stroke();
            var _b = __read(getLinkTextXOffset({ textAlign: textAlign, width: width, valueWidth: valueWidth, isRTL: isRTL }, labelValueGap), 2), labelX = _b[0], valueX = _b[1];
            (0, canvas_1.withContext)(ctx, function () {
                ctx.translate.apply(ctx, __spreadArray([], __read(translate), false));
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
var midlineOffset = 0.35;
function renderPartitionCanvas2d(ctx, dpr, _a) {
    var layout = _a.layout, width = _a.width, height = _a.height, style = _a.style, quadViewModel = _a.quadViewModel, rowSets = _a.rowSets, outsideLinksViewModel = _a.outsideLinksViewModel, linkLabelViewModels = _a.linkLabelViewModels, diskCenter = _a.diskCenter, outerRadius = _a.outerRadius, panel = _a.panel, chartDimensions = _a.chartDimensions;
    var sectorLineWidth = style.sectorLineWidth, sectorLineStroke = style.sectorLineStroke, linkLabel = style.linkLabel;
    var linkLineColor = linkLabelViewModels.strokeColor;
    (0, canvas_1.withContext)(ctx, function () {
        ctx.scale(dpr, dpr);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = (0, text_utils_1.cssFontShorthand)(panel.fontFace, panel.fontSize);
        ctx.fillStyle = panel.fontFace.textColor;
        var innerPad = midlineOffset * panel.fontSize;
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
            function () { return ((0, viewmodel_1.isSunburst)(layout) ? renderSectors(ctx, quadViewModel) : renderRectangles(ctx, quadViewModel)); },
            function () { return renderRowSets(ctx, rowSets, linkLineColor); },
            function () { return renderFillOutsideLinks(ctx, outsideLinksViewModel, linkLineColor, linkLabel.lineWidth); },
            function () { return renderLinkLabels(ctx, linkLabel.fontSize, linkLabel.lineWidth, linkLabelViewModels, linkLineColor); },
        ]);
    });
}
exports.renderPartitionCanvas2d = renderPartitionCanvas2d;
//# sourceMappingURL=canvas_renderers.js.map