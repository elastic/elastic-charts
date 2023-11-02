"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderXYChartCanvas2d = void 0;
const animations_1 = require("./animations");
const annotations_1 = require("./annotations");
const areas_1 = require("./areas");
const bars_1 = require("./bars");
const bubbles_1 = require("./bubbles");
const grids_1 = require("./grids");
const lines_1 = require("./lines");
const panels_1 = require("./panels/panels");
const debug_1 = require("./utils/debug");
const bar_1 = require("./values/bar");
const colors_1 = require("../../../../common/colors");
const canvas_1 = require("../../../../renderers/canvas");
function renderXYChartCanvas2d(ctx, dpr, props, animationState) {
    function render(aCtx) {
        const imgCanvas = document.createElement('canvas');
        (0, canvas_1.withContext)(ctx, () => {
            ctx.scale(dpr, dpr);
            const { renderingArea, chartTransform, rotation, geometries, geometriesIndex, theme: { axes: sharedAxesStyle, sharedStyle, barSeriesStyle, background }, highlightedLegendItem, annotationDimensions, annotationSpecs, perPanelAxisGeoms, perPanelGridLines, axesSpecs, axesStyles, debug, panelGeoms, hoveredAnnotationIds, locale, } = props;
            const transform = { x: renderingArea.left + chartTransform.x, y: renderingArea.top + chartTransform.y };
            (0, canvas_1.renderLayers)(ctx, [
                () => (0, canvas_1.clearCanvas)(ctx, 'transparent'),
                () => debug && (0, panels_1.renderGridPanels)(ctx, transform, panelGeoms),
                () => (0, grids_1.renderGrids)(ctx, {
                    axesSpecs,
                    renderingArea,
                    perPanelGridLines,
                    axesStyles,
                    sharedAxesStyle,
                }),
                () => (0, panels_1.renderPanelSubstrates)(ctx, {
                    axesSpecs,
                    perPanelAxisGeoms,
                    renderingArea,
                    debug,
                    axesStyles,
                    sharedAxesStyle,
                }, locale),
                () => (0, annotations_1.renderAnnotations)(ctx, aCtx, annotationDimensions, annotationSpecs, rotation, renderingArea, sharedStyle, hoveredAnnotationIds, true),
                () => (0, bars_1.renderBars)(ctx, imgCanvas, geometries.bars, sharedStyle, rotation, renderingArea, highlightedLegendItem),
                () => (0, areas_1.renderAreas)(ctx, imgCanvas, geometries.areas, sharedStyle, rotation, renderingArea, highlightedLegendItem),
                () => (0, lines_1.renderLines)(ctx, geometries.lines, sharedStyle, rotation, renderingArea, highlightedLegendItem),
                () => (0, bubbles_1.renderBubbles)(ctx, geometries.bubbles, sharedStyle, rotation, renderingArea, highlightedLegendItem),
                () => geometries.bars.forEach(({ value: bars, panel }) => (0, bar_1.renderBarValues)(ctx, {
                    bars,
                    panel,
                    renderingArea,
                    rotation,
                    debug,
                    barSeriesStyle,
                    background,
                })),
                () => (0, annotations_1.renderAnnotations)(ctx, aCtx, annotationDimensions, annotationSpecs, rotation, renderingArea, sharedStyle, hoveredAnnotationIds, false),
                () => debug &&
                    (0, canvas_1.withContext)(ctx, () => {
                        const { left, top, width, height } = renderingArea;
                        (0, debug_1.renderDebugRect)(ctx, { x: left, y: top, width, height }, 0, { color: colors_1.Colors.Transparent.rgba }, { color: colors_1.Colors.Red.rgba, width: 4, dash: [4, 4] });
                        const voronoi = geometriesIndex.triangulation([0, 0, width, height]);
                        if (voronoi) {
                            ctx.beginPath();
                            ctx.translate(left, top);
                            ctx.setLineDash([5, 5]);
                            voronoi.render(ctx);
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = 'blue';
                            ctx.stroke();
                        }
                    }),
            ]);
        });
    }
    void (0, animations_1.getAnimationPoolFn)(animationState, render);
}
exports.renderXYChartCanvas2d = renderXYChartCanvas2d;
//# sourceMappingURL=renderers.js.map