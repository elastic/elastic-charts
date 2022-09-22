"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderXYChartCanvas2d = void 0;
var colors_1 = require("../../../../common/colors");
var canvas_1 = require("../../../../renderers/canvas");
var animations_1 = require("./animations");
var annotations_1 = require("./annotations");
var areas_1 = require("./areas");
var bars_1 = require("./bars");
var bubbles_1 = require("./bubbles");
var grids_1 = require("./grids");
var lines_1 = require("./lines");
var panels_1 = require("./panels/panels");
var debug_1 = require("./utils/debug");
var bar_1 = require("./values/bar");
function renderXYChartCanvas2d(ctx, dpr, props, animationState) {
    function render(aCtx) {
        var imgCanvas = document.createElement('canvas');
        (0, canvas_1.withContext)(ctx, function () {
            ctx.scale(dpr, dpr);
            var renderingArea = props.renderingArea, chartTransform = props.chartTransform, rotation = props.rotation, geometries = props.geometries, geometriesIndex = props.geometriesIndex, _a = props.theme, sharedAxesStyle = _a.axes, sharedStyle = _a.sharedStyle, barSeriesStyle = _a.barSeriesStyle, background = _a.background, highlightedLegendItem = props.highlightedLegendItem, annotationDimensions = props.annotationDimensions, annotationSpecs = props.annotationSpecs, perPanelAxisGeoms = props.perPanelAxisGeoms, perPanelGridLines = props.perPanelGridLines, axesSpecs = props.axesSpecs, axesStyles = props.axesStyles, debug = props.debug, panelGeoms = props.panelGeoms, hoveredAnnotationIds = props.hoveredAnnotationIds;
            var transform = { x: renderingArea.left + chartTransform.x, y: renderingArea.top + chartTransform.y };
            (0, canvas_1.renderLayers)(ctx, [
                function () { return (0, canvas_1.clearCanvas)(ctx, 'transparent'); },
                function () { return debug && (0, panels_1.renderGridPanels)(ctx, transform, panelGeoms); },
                function () {
                    return (0, grids_1.renderGrids)(ctx, {
                        axesSpecs: axesSpecs,
                        renderingArea: renderingArea,
                        perPanelGridLines: perPanelGridLines,
                        axesStyles: axesStyles,
                        sharedAxesStyle: sharedAxesStyle,
                    });
                },
                function () {
                    return (0, panels_1.renderPanelSubstrates)(ctx, {
                        axesSpecs: axesSpecs,
                        perPanelAxisGeoms: perPanelAxisGeoms,
                        renderingArea: renderingArea,
                        debug: debug,
                        axesStyles: axesStyles,
                        sharedAxesStyle: sharedAxesStyle,
                    });
                },
                function () {
                    return (0, annotations_1.renderAnnotations)(ctx, aCtx, annotationDimensions, annotationSpecs, rotation, renderingArea, sharedStyle, hoveredAnnotationIds, true);
                },
                function () { return (0, bars_1.renderBars)(ctx, imgCanvas, geometries.bars, sharedStyle, rotation, renderingArea, highlightedLegendItem); },
                function () {
                    return (0, areas_1.renderAreas)(ctx, imgCanvas, geometries.areas, sharedStyle, rotation, renderingArea, highlightedLegendItem);
                },
                function () { return (0, lines_1.renderLines)(ctx, geometries.lines, sharedStyle, rotation, renderingArea, highlightedLegendItem); },
                function () { return (0, bubbles_1.renderBubbles)(ctx, geometries.bubbles, sharedStyle, rotation, renderingArea, highlightedLegendItem); },
                function () {
                    return geometries.bars.forEach(function (_a) {
                        var bars = _a.value, panel = _a.panel;
                        return (0, bar_1.renderBarValues)(ctx, {
                            bars: bars,
                            panel: panel,
                            renderingArea: renderingArea,
                            rotation: rotation,
                            debug: debug,
                            barSeriesStyle: barSeriesStyle,
                            background: background,
                        });
                    });
                },
                function () {
                    return (0, annotations_1.renderAnnotations)(ctx, aCtx, annotationDimensions, annotationSpecs, rotation, renderingArea, sharedStyle, hoveredAnnotationIds, false);
                },
                function () {
                    return debug &&
                        (0, canvas_1.withContext)(ctx, function () {
                            var left = renderingArea.left, top = renderingArea.top, width = renderingArea.width, height = renderingArea.height;
                            (0, debug_1.renderDebugRect)(ctx, { x: left, y: top, width: width, height: height }, 0, { color: colors_1.Colors.Transparent.rgba }, { color: colors_1.Colors.Red.rgba, width: 4, dash: [4, 4] });
                            var voronoi = geometriesIndex.triangulation([0, 0, width, height]);
                            if (voronoi) {
                                ctx.beginPath();
                                ctx.translate(left, top);
                                ctx.setLineDash([5, 5]);
                                voronoi.render(ctx);
                                ctx.lineWidth = 1;
                                ctx.strokeStyle = 'blue';
                                ctx.stroke();
                            }
                        });
                },
            ]);
        });
    }
    void (0, animations_1.getAnimationPoolFn)(animationState, render);
}
exports.renderXYChartCanvas2d = renderXYChartCanvas2d;
//# sourceMappingURL=renderers.js.map