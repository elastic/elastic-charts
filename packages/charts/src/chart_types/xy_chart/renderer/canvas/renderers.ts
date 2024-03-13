/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnimationContext, getAnimationPoolFn } from './animations';
import { AnimationState } from './animations/animation';
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
import { Colors } from '../../../../common/colors';
import { clearCanvas, renderLayers, withContext } from '../../../../renderers/canvas';

/** @internal */
export function renderXYChartCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  props: ReactiveChartStateProps,
  animationState: AnimationState,
) {
  function render(aCtx: AnimationContext) {
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
        theme: {
          axes: sharedAxesStyle,
          sharedStyle,
          lineAnnotation: lineAnnotationStyle,
          rectAnnotation: rectAnnotationStyle,
          barSeriesStyle,
          background,
        },
        highlightedLegendItem,
        annotationDimensions,
        annotationSpecs,
        perPanelAxisGeoms,
        perPanelGridLines,
        axesSpecs,
        axesStyles,
        debug,
        panelGeoms,
        hoveredAnnotationIds,
        locale,
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
          renderPanelSubstrates(
            ctx,
            {
              axesSpecs,
              perPanelAxisGeoms,
              renderingArea,
              debug,
              axesStyles,
              sharedAxesStyle,
            },
            locale,
          ),

        // rendering background annotations
        () =>
          renderAnnotations(
            ctx,
            aCtx,
            annotationDimensions,
            annotationSpecs,
            rotation,
            renderingArea,
            sharedStyle,
            hoveredAnnotationIds,
            lineAnnotationStyle,
            rectAnnotationStyle,
            true,
          ),

        // rendering bars
        () => renderBars(ctx, imgCanvas, geometries.bars, sharedStyle, rotation, renderingArea, highlightedLegendItem),

        // rendering areas
        () =>
          renderAreas(ctx, imgCanvas, geometries.areas, sharedStyle, rotation, renderingArea, highlightedLegendItem),

        // rendering lines
        () => renderLines(ctx, geometries.lines, sharedStyle, rotation, renderingArea, highlightedLegendItem),

        // rendering bubbles
        () => renderBubbles(ctx, geometries.bubbles, sharedStyle, rotation, renderingArea, highlightedLegendItem),

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
        () =>
          renderAnnotations(
            ctx,
            aCtx,
            annotationDimensions,
            annotationSpecs,
            rotation,
            renderingArea,
            sharedStyle,
            hoveredAnnotationIds,
            lineAnnotationStyle,
            rectAnnotationStyle,
            false,
          ),

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

  void getAnimationPoolFn(animationState, render);
}
