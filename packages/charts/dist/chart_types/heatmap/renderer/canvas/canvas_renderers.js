"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHeatmapCanvas2d = void 0;
const utils_1 = require("./utils");
const canvas_1 = require("../../../../renderers/canvas");
const common_1 = require("../../../../utils/common");
const dimensions_1 = require("../../../../utils/dimensions");
const line_1 = require("../../../xy_chart/renderer/canvas/primitives/line");
const rect_1 = require("../../../xy_chart/renderer/canvas/primitives/rect");
const text_1 = require("../../../xy_chart/renderer/canvas/primitives/text");
function renderHeatmapCanvas2d(ctx, dpr, props) {
    const { theme } = props.geometries;
    const { heatmapViewModels } = props.geometries;
    const { theme: { sharedStyle: sharedGeometryStyle }, background, elementSizes, highlightedLegendBands, } = props;
    if (heatmapViewModels.length === 0)
        return;
    (0, canvas_1.withContext)(ctx, () => {
        ctx.scale(dpr, dpr);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineCap = 'square';
        (0, canvas_1.renderLayers)(ctx, [
            () => (0, canvas_1.clearCanvas)(ctx, background),
            () => {
                heatmapViewModels.forEach(({ gridOrigin: { x, y }, gridLines }) => {
                    (0, canvas_1.withContext)(ctx, () => {
                        ctx.translate(x, y);
                        (0, line_1.renderMultiLine)(ctx, gridLines.x, gridLines.stroke);
                        (0, line_1.renderMultiLine)(ctx, gridLines.y, gridLines.stroke);
                    });
                });
            },
            () => heatmapViewModels.forEach(({ gridOrigin: { x, y }, cells }) => {
                (0, canvas_1.withContext)(ctx, () => {
                    ctx.translate(x, y);
                    cells.forEach((cell) => {
                        if (cell.visible) {
                            const geometryStateStyle = (0, utils_1.getGeometryStateStyle)(cell, sharedGeometryStyle, highlightedLegendBands);
                            const style = (0, utils_1.getColorBandStyle)(cell, geometryStateStyle);
                            (0, rect_1.renderRect)(ctx, cell, style.fill, style.stroke);
                        }
                    });
                });
            }),
            () => {
                if (!theme.cell.label.visible)
                    return;
                heatmapViewModels.forEach(({ cellFontSize, gridOrigin: { x, y }, cells }) => {
                    (0, canvas_1.withContext)(ctx, () => {
                        ctx.translate(x, y);
                        cells.forEach((cell) => {
                            const fontSize = cellFontSize(cell);
                            if (cell.visible && Number.isFinite(fontSize))
                                (0, text_1.renderText)(ctx, { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, cell.formatted, {
                                    ...theme.cell.label,
                                    fontSize,
                                    align: 'center',
                                    baseline: 'middle',
                                    textColor: cell.textColor,
                                });
                        });
                    });
                });
            },
            () => {
                if (!theme.yAxisLabel.visible)
                    return;
                heatmapViewModels.forEach(({ yValues, gridOrigin: { x, y } }) => {
                    (0, canvas_1.withContext)(ctx, () => {
                        ctx.translate(x, y);
                        const font = {
                            ...theme.yAxisLabel,
                            baseline: 'middle',
                            align: 'right',
                        };
                        const { padding } = theme.yAxisLabel;
                        const horizontalPadding = (0, dimensions_1.horizontalPad)(padding);
                        yValues.forEach(({ x, y, text }) => {
                            const textLines = (0, text_1.wrapLines)(ctx, text, font, theme.yAxisLabel.fontSize, Math.max(elementSizes.yAxis.width - horizontalPadding, 0), theme.yAxisLabel.fontSize, { shouldAddEllipsis: true, wrapAtWord: false }).lines;
                            if (textLines[0])
                                (0, text_1.renderText)(ctx, { x, y }, textLines[0], font);
                        });
                    });
                });
            },
            () => {
                if (!theme.xAxisLabel.visible)
                    return;
                heatmapViewModels.forEach(({ xValues, gridOrigin: { x, y } }) => {
                    (0, canvas_1.withContext)(ctx, () => {
                        ctx.translate(x, y + elementSizes.xAxis.top);
                        xValues
                            .filter((_, i) => i % elementSizes.xAxisTickCadence === 0)
                            .forEach(({ x, y, text, align }) => {
                            const textLines = (0, text_1.wrapLines)(ctx, text, theme.xAxisLabel, theme.xAxisLabel.fontSize, Infinity, 16, { shouldAddEllipsis: true, wrapAtWord: false }).lines;
                            if (textLines[0]) {
                                (0, text_1.renderText)(ctx, { x, y }, textLines[0], { ...theme.xAxisLabel, baseline: 'middle', align }, (0, common_1.radToDeg)(-elementSizes.xLabelRotation));
                            }
                        });
                    });
                });
            },
            () => heatmapViewModels
                .filter(({ titles }) => titles.length > 0)
                .forEach(({ titles, gridOrigin: { x, y } }) => {
                (0, canvas_1.withContext)(ctx, () => {
                    ctx.translate(x, y);
                    titles
                        .filter((t) => t.visible && t.text !== '')
                        .forEach((title) => {
                        (0, text_1.renderText)(ctx, title.origin, title.text, {
                            ...title,
                            baseline: 'middle',
                            align: 'center',
                        }, title.rotation);
                    });
                });
            }),
        ]);
    });
}
exports.renderHeatmapCanvas2d = renderHeatmapCanvas2d;
//# sourceMappingURL=canvas_renderers.js.map