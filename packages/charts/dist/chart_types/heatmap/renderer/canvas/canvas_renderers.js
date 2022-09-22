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
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCanvas2d = void 0;
var canvas_1 = require("../../../../renderers/canvas");
var common_1 = require("../../../../utils/common");
var dimensions_1 = require("../../../../utils/dimensions");
var line_1 = require("../../../xy_chart/renderer/canvas/primitives/line");
var rect_1 = require("../../../xy_chart/renderer/canvas/primitives/rect");
var text_1 = require("../../../xy_chart/renderer/canvas/primitives/text");
function renderCanvas2d(ctx, dpr, _a, background, elementSizes, debug) {
    var theme = _a.theme, heatmapViewModel = _a.heatmapViewModel;
    (0, canvas_1.withContext)(ctx, function () {
        ctx.scale(dpr, dpr);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineCap = 'square';
        var filteredCells = heatmapViewModel.cells.filter(function (cell) { return cell.yIndex < heatmapViewModel.pageSize; });
        var filteredYValues = heatmapViewModel.yValues.filter(function (value, yIndex) { return yIndex < heatmapViewModel.pageSize; });
        (0, canvas_1.renderLayers)(ctx, [
            function () { return (0, canvas_1.clearCanvas)(ctx, background); },
            function () {
                return debug &&
                    (0, canvas_1.withContext)(ctx, function () {
                        ctx.strokeStyle = 'black';
                        ctx.strokeRect(elementSizes.grid.left, elementSizes.grid.top, elementSizes.grid.width, elementSizes.grid.height);
                        ctx.strokeStyle = 'red';
                        ctx.strokeRect(elementSizes.xAxis.left, elementSizes.xAxis.top, elementSizes.xAxis.width, elementSizes.xAxis.height);
                        ctx.strokeStyle = 'violet';
                        ctx.strokeRect(elementSizes.yAxis.left, elementSizes.yAxis.top, elementSizes.yAxis.width, elementSizes.yAxis.height);
                    });
            },
            function () {
                (0, canvas_1.withContext)(ctx, function () {
                    (0, line_1.renderMultiLine)(ctx, heatmapViewModel.gridLines.x, heatmapViewModel.gridLines.stroke);
                    (0, line_1.renderMultiLine)(ctx, heatmapViewModel.gridLines.y, heatmapViewModel.gridLines.stroke);
                });
            },
            function () {
                return (0, canvas_1.withContext)(ctx, function () {
                    var _a = heatmapViewModel.gridOrigin, x = _a.x, y = _a.y;
                    ctx.translate(x, y);
                    filteredCells.forEach(function (cell) {
                        if (cell.visible)
                            (0, rect_1.renderRect)(ctx, cell, cell.fill, cell.stroke);
                    });
                });
            },
            function () {
                return theme.cell.label.visible &&
                    (0, canvas_1.withContext)(ctx, function () {
                        var _a = heatmapViewModel.gridOrigin, x = _a.x, y = _a.y;
                        ctx.translate(x, y);
                        filteredCells.forEach(function (cell) {
                            var fontSize = heatmapViewModel.cellFontSize(cell);
                            if (cell.visible && Number.isFinite(fontSize))
                                (0, text_1.renderText)(ctx, { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, cell.formatted, __assign(__assign({}, theme.cell.label), { fontSize: fontSize, align: 'center', baseline: 'middle', textColor: cell.textColor }));
                        });
                    });
            },
            function () {
                return theme.yAxisLabel.visible &&
                    (0, canvas_1.withContext)(ctx, function () {
                        ctx.translate(elementSizes.yAxis.left + elementSizes.yAxis.width, elementSizes.yAxis.top);
                        var font = __assign(__assign({}, theme.yAxisLabel), { baseline: 'middle', align: 'right' });
                        var padding = theme.yAxisLabel.padding;
                        var horizontalPadding = (0, dimensions_1.horizontalPad)(padding);
                        filteredYValues.forEach(function (_a) {
                            var x = _a.x, y = _a.y, text = _a.text;
                            var textLines = (0, text_1.wrapLines)(ctx, text, font, theme.yAxisLabel.fontSize, Math.max(elementSizes.yAxis.width - horizontalPadding, 0), theme.yAxisLabel.fontSize, { shouldAddEllipsis: true, wrapAtWord: false }).lines;
                            (0, text_1.renderText)(ctx, { x: x, y: y }, textLines.length > 0 ? textLines[0] : '…', font);
                        });
                    });
            },
            function () {
                return theme.xAxisLabel.visible &&
                    (0, canvas_1.withContext)(ctx, function () {
                        ctx.translate(elementSizes.xAxis.left, elementSizes.xAxis.top);
                        heatmapViewModel.xValues
                            .filter(function (_, i) { return i % elementSizes.xAxisTickCadence === 0; })
                            .forEach(function (_a) {
                            var x = _a.x, y = _a.y, text = _a.text, align = _a.align;
                            var textLines = (0, text_1.wrapLines)(ctx, text, theme.xAxisLabel, theme.xAxisLabel.fontSize, Infinity, 16, { shouldAddEllipsis: true, wrapAtWord: false }).lines;
                            (0, text_1.renderText)(ctx, { x: x, y: y }, textLines.length > 0 ? textLines[0] : '…', __assign(__assign({}, theme.xAxisLabel), { baseline: 'middle', align: align }), (0, common_1.radToDeg)(-elementSizes.xLabelRotation));
                        });
                    });
            },
            function () {
                return (0, canvas_1.withContext)(ctx, function () {
                    heatmapViewModel.titles
                        .filter(function (t) { return t.visible && t.text !== ''; })
                        .forEach(function (title) {
                        (0, text_1.renderText)(ctx, title.origin, title.text, __assign(__assign({}, title), { baseline: 'middle', align: 'center' }), title.rotation);
                    });
                });
            },
        ]);
    });
}
exports.renderCanvas2d = renderCanvas2d;
//# sourceMappingURL=canvas_renderers.js.map