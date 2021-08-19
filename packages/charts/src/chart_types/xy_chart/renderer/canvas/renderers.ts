/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { stringToRGB } from '../../../../common/color_library_wrappers';
import { Rect } from '../../../../geoms/types';
import { withContext, renderLayers, clearCanvas } from '../../../../renderers/canvas';
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
      theme: { axes: sharedAxesStyle, sharedStyle, barSeriesStyle },
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
    const transform = {
      x: renderingArea.left + chartTransform.x,
      y: renderingArea.top + chartTransform.y,
    };
    // painter's algorithm, like that of SVG: the sequence determines what overdraws what; first element of the array is drawn first
    // (of course, with SVG, it's for ambiguous situations only, eg. when 3D transforms with different Z values aren't used, but
    // unlike SVG and esp. WebGL, Canvas2d doesn't support the 3rd dimension well, see ctx.transform / ctx.setTransform).
    // The layers are callbacks, because of the need to not bake in the `ctx`, it feels more composable and uncoupled this way.
    renderLayers(ctx, [
      // clear the canvas
      clearCanvas,
      // render panel grid
      (ctx: CanvasRenderingContext2D) => {
        if (debug) {
          renderGridPanels(ctx, transform, panelGeoms);
        }
      },
      (ctx: CanvasRenderingContext2D) => {
        renderGrids(ctx, {
          axesSpecs,
          renderingArea,
          perPanelGridLines,
          axesStyles,
          sharedAxesStyle,
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        renderPanelSubstrates(ctx, {
          axesSpecs,
          perPanelAxisGeoms,
          renderingArea,
          debug,
          axesStyles,
          sharedAxesStyle,
        });
      },
      // rendering background annotations
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, () => {
          renderAnnotations(
            ctx,
            {
              rotation,
              renderingArea,
              annotationDimensions,
              annotationSpecs,
            },
            true,
          );
        });
      },

      // rendering bars
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, () => {
          renderBars(
            ctx,
            imgCanvas,
            geometries.bars,
            sharedStyle,
            clippings,
            renderingArea,
            highlightedLegendItem,
            rotation,
          );
        });
      },
      // rendering areas
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, () => {
          renderAreas(ctx, imgCanvas, {
            areas: geometries.areas,
            clippings,
            renderingArea,
            rotation,
            highlightedLegendItem,
            sharedStyle,
          });
        });
      },
      // rendering lines
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, () => {
          renderLines(ctx, {
            lines: geometries.lines,
            clippings,
            renderingArea,
            rotation,
            highlightedLegendItem,
            sharedStyle,
          });
        });
      },
      // rendering bubbles
      (ctx: CanvasRenderingContext2D) => {
        renderBubbles(ctx, {
          bubbles: geometries.bubbles,
          clippings,
          highlightedLegendItem,
          sharedStyle,
          rotation,
          renderingArea,
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        geometries.bars.forEach(({ value: bars, panel }) => {
          withContext(ctx, () => {
            renderBarValues(ctx, {
              bars,
              panel,
              renderingArea,
              rotation,
              debug,
              barSeriesStyle,
            });
          });
        });
      },
      // rendering foreground annotations
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, () => {
          renderAnnotations(
            ctx,
            {
              annotationDimensions,
              annotationSpecs,
              rotation,
              renderingArea,
            },
            false,
          );
        });
      },
      // rendering debugger
      (ctx: CanvasRenderingContext2D) => {
        if (!debug) {
          return;
        }
        withContext(ctx, () => {
          const { left, top, width, height } = renderingArea;

          renderDebugRect(
            ctx,
            {
              x: left,
              y: top,
              width,
              height,
            },
            {
              color: stringToRGB('transparent'),
            },
            {
              color: stringToRGB('red'),
              width: 4,
              dash: [4, 4],
            },
          );

          const triangulation = geometriesIndex.triangulation([0, 0, width, height]);

          if (triangulation) {
            ctx.beginPath();
            ctx.translate(left, top);
            ctx.setLineDash([5, 5]);
            triangulation.render(ctx);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
          }
        });
      },
    ]);
  });
}
