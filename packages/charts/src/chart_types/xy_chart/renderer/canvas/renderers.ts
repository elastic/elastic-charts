/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AnimationContext } from './animations';
import { getAnimationPoolFn, getTransitionAnimationContext } from './animations';
import type { AnimationState } from './animations/animation';
import { renderAnnotations } from './annotations';
import { renderAreas } from './areas';
import { renderBars } from './bars';
import { renderBubbles } from './bubbles';
import { renderGrids } from './grids';
import { renderLines } from './lines';
import { renderGridPanels, renderPanelSubstrates } from './panels/panels';
import { renderBarValues } from './values/bar';
import type { ReactiveChartStateProps } from './xy_chart';
import { Colors } from '../../../../common/colors';
import { renderLayers, withContext } from '../../../../renderers/canvas';
import { renderDebugRect } from '../../../../renderers/canvas/utils/debug';
import type { Painter } from '../../../../renderers/painter';

/**
 * Draws one frame of an XY chart, every animated value as `aCtx` resolves it.
 * @internal
 */
export function drawXYChart(painter: Painter, props: ReactiveChartStateProps, aCtx: AnimationContext) {
  withContext(painter, () => {
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
      highlightedItems,
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

    renderLayers(painter, [
      () => painter.clear(Colors.Transparent.keyword),

      // render panel grid
      () => debug && renderGridPanels(painter, transform, panelGeoms),

      () =>
        renderGrids(painter, {
          axesSpecs,
          renderingArea,
          perPanelGridLines,
          axesStyles,
          sharedAxesStyle,
        }),

      () =>
        renderPanelSubstrates(
          painter,
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
          painter,
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
      () => renderBars(painter, geometries.bars, sharedStyle, rotation, renderingArea, highlightedItems),

      // rendering areas
      () => renderAreas(painter, geometries.areas, rotation, renderingArea, highlightedItems),

      // rendering lines
      () => renderLines(painter, geometries.lines, rotation, renderingArea, highlightedItems),

      // rendering bubbles
      () => renderBubbles(painter, geometries.bubbles, sharedStyle, rotation, renderingArea, highlightedItems),

      () =>
        geometries.bars.forEach(({ value: bars, panel }) =>
          renderBarValues(painter, {
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
          painter,
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
        withContext(painter, () => {
          const { left, top, width, height } = renderingArea;

          renderDebugRect(
            painter,
            { x: left, y: top, width, height },
            0,
            { color: Colors.Transparent.rgba },
            { color: Colors.Red.rgba, width: 4, dash: [4, 4] },
          );
          const voronoi = geometriesIndex.triangulation([0, 0, width, height]);
          if (voronoi) {
            painter.translate(left, top);
            painter.setLineDash([5, 5]);
            painter.lineWidth = 1;
            painter.strokeStyle = 'blue';
            painter.beginPath();
            voronoi.render(painter);
            painter.stroke();
          }
        }),
    ]);
  });
}

/**
 * Renders an XY chart: on canvas through the animation pool's frames, on svg as one frame per render
 * whose values are at their targets, the elements transitioning to them through CSS.
 * @internal
 */
export function renderXYChart(painter: Painter, props: ReactiveChartStateProps, animationState: AnimationState) {
  const render = (aCtx: AnimationContext) => drawXYChart(painter, props, aCtx);
  if (!painter.animates) {
    render(getTransitionAnimationContext(painter));
  } else {
    void getAnimationPoolFn(animationState, render);
  }
}
