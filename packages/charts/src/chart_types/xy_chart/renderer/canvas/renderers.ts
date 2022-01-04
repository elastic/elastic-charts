/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Colors } from '../../../../common/colors';
import { Rect } from '../../../../geoms/types';
import { clearCanvas, isCanvasRenderer, renderLayers, withContext } from '../../../../renderers/canvas';
import { renderAnnotations } from './annotations';
import { renderAreas } from './areas';
import { renderBars } from './bars';
import { renderBubbles } from './bubbles';
import { renderGrids } from './grids';
import { renderLines } from './lines';
import { renderGridPanels, renderPanelSubstrates } from './panels/panels';
import { renderDebugRect } from './utils/debug';
import { renderBarValues } from './values/bar';
import { ReactiveChartStateProps } from './xy_chart';

/** @internal */
export function renderXYChartCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  clippings: Rect,
  props: ReactiveChartStateProps,
) {
  const imgCanvas = document.createElement('canvas');

  withContext(ctx, () => {
    // let's set the devicePixelRatio once and for all; then we'll never worry about it again
    ctx.scale(dpr, dpr);
    const {
      renderingArea,
      chartTransform,
      rotation,
      geometries,
      geometriesIndex,
      theme: { axes: sharedAxesStyle, sharedStyle, barSeriesStyle, background },
      highlightedLegendItem,
      annotationDimensions,
      annotationSpecs,
      perPanelAxisGeoms,
      perPanelGridLines,
      axesSpecs,
      axesStyles,
      debug,
      panelGeoms,
    } = props;
    const transform = { x: renderingArea.left + chartTransform.x, y: renderingArea.top + chartTransform.y };
    renderLayers(ctx, [
      () => clearCanvas(ctx, 'transparent'),

      // render panel grid
      () => debug && renderGridPanels(ctx, transform, panelGeoms),

      () =>
        renderGrids(ctx, {
          axesSpecs,
          renderingArea,
          perPanelGridLines,
          axesStyles,
          sharedAxesStyle,
        }),

      () =>
        renderPanelSubstrates(ctx, {
          axesSpecs,
          perPanelAxisGeoms,
          renderingArea,
          debug,
          axesStyles,
          sharedAxesStyle,
        }),

      // rendering background annotations
      () => renderAnnotations(ctx, { rotation, renderingArea, annotationDimensions, annotationSpecs }, true),

      // rendering bars
      () =>
        renderBars(
          ctx,
          imgCanvas,
          geometries.bars,
          sharedStyle,
          clippings,
          renderingArea,
          highlightedLegendItem,
          rotation,
        ),

      // rendering areas
      () =>
        renderAreas(ctx, imgCanvas, {
          areas: geometries.areas,
          clippings,
          renderingArea,
          rotation,
          highlightedLegendItem,
          sharedStyle,
        }),

      // rendering lines
      () =>
        renderLines(ctx, {
          lines: geometries.lines,
          clippings,
          renderingArea,
          rotation,
          highlightedLegendItem,
          sharedStyle,
        }),

      // rendering bubbles
      () =>
        renderBubbles(ctx, {
          bubbles: geometries.bubbles,
          clippings,
          highlightedLegendItem,
          sharedStyle,
          rotation,
          renderingArea,
        }),

      () =>
        geometries.bars.forEach(({ value: bars, panel }) =>
          renderBarValues(ctx, {
            bars,
            panel,
            renderingArea,
            rotation,
            debug,
            barSeriesStyle,
            background,
          }),
        ),

      // rendering foreground annotations
      () => renderAnnotations(ctx, { annotationDimensions, annotationSpecs, rotation, renderingArea }, false),

      // rendering debugger
      () =>
        debug &&
        withContext(ctx, () => {
          const { left, top, width, height } = renderingArea;

          renderDebugRect(
            ctx,
            { x: left, y: top, width, height },
            0,
            { color: Colors.Transparent.rgba },
            { color: Colors.Red.rgba, width: 4, dash: [4, 4] },
          );

          const renderer = geometriesIndex.triangulation([0, 0, width, height])?.render;
          if (isCanvasRenderer(renderer)) {
            ctx.beginPath();
            ctx.translate(left, top);
            ctx.setLineDash([5, 5]);
            renderer(ctx);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
          }
        }),
    ]);
  });
}
