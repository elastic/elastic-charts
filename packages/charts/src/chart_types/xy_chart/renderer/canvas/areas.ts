/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPanelClipping } from './panel_clipping';
import { renderPoints } from './points';
import { renderLinePaths, renderAreaPath } from './primitives/path';
import { buildAreaStyles } from './styles/area';
import { buildLineStyles } from './styles/line';
import { withPanelTransform } from './utils/panel_transform';
import type { LegendItem } from '../../../../common/legend';
import type { Rect } from '../../../../geoms/types';
import { withContext } from '../../../../renderers/canvas';
import type { Rotation } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';
import {
  getGeometryHighlightState,
  getGeometryHighlightStateStyle,
  type AreaGeometry,
  type PerPanel,
} from '../../../../utils/geometry';
import type { GeometryStateStyle, SharedGeometryStateStyle } from '../../../../utils/themes/theme';

/** @internal */
export function renderAreas(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  areas: Array<PerPanel<AreaGeometry>>,
  sharedStyle: SharedGeometryStateStyle,
  rotation: Rotation,
  renderingArea: Dimensions,
  highlightedLegendItem?: LegendItem,
) {
  withContext(ctx, () => {
    const areasWithStyle = areas
      .map(({ panel, value }) => {
        const highlightState = getGeometryHighlightState(value.seriesIdentifier.key, highlightedLegendItem);
        return {
          panel,
          area: value,
          highlightState,
          geometryStyle: getGeometryHighlightStateStyle(sharedStyle, highlightState),
        };
      })
      // sort by dimmed first once are rendered ontop of the non-highlighted ones
      .sort(({ highlightState }) => (highlightState === 'dimmed' ? -1 : 1));

    // first render all the areas and lines
    areasWithStyle.forEach(({ panel, area, geometryStyle }) => {
      const clippings = getPanelClipping(panel, rotation);
      if (area.style.area.visible) {
        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () => renderArea(ctx, imgCanvas, area, geometryStyle, clippings),
          { area: clippings, shouldClip: true },
        );
      }
      if (area.style.line.visible) {
        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () => renderAreaLines(ctx, area, geometryStyle, clippings),
          { area: clippings, shouldClip: true },
        );
      }
    });
    // now we can render the visible points on top of each the areas/lines
    areasWithStyle.forEach(({ panel, area: { style, points, hasFit, minPointDistance }, geometryStyle }) => {
      withPanelTransform(
        ctx,
        panel,
        rotation,
        renderingArea,
        () =>
          renderPoints(
            ctx,
            points,
            geometryStyle,
            style.point,
            style.line.strokeWidth,
            minPointDistance,
            style.pointVisibilityMinDistance,
            // has a connecting line only if is fit and there are more than one point on the chart
            hasFit && points.length > 1,
          ),
        { area: getPanelClipping(panel, rotation), shouldClip: points[0]?.value.mark !== null },
      );
    });
  });
}

function renderArea(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  geometry: AreaGeometry,
  geometryStateStyle: GeometryStateStyle,
  clippings: Rect,
) {
  const { area, color, transform, style, clippedRanges, shouldClip } = geometry;
  const areaFill = buildAreaStyles(ctx, imgCanvas, color, style.area, geometryStateStyle);
  const fitAreaFill = buildAreaStyles(ctx, imgCanvas, color, style.fit.area, geometryStateStyle);

  renderAreaPath(
    ctx,
    transform,
    area,
    areaFill,
    fitAreaFill,
    clippedRanges,
    clippings,
    shouldClip && style.fit.area.visible,
  );
}

function renderAreaLines(
  ctx: CanvasRenderingContext2D,
  geometry: AreaGeometry,
  geometryStateStyle: GeometryStateStyle,
  clippings: Rect,
) {
  const { lines, color, transform, style, clippedRanges, shouldClip } = geometry;

  const lineStyle = buildLineStyles(color, style.line, geometryStateStyle);
  const fitLineStroke = buildLineStyles(
    color,
    { ...style.fit.line, strokeWidth: style.line.strokeWidth },
    geometryStateStyle,
  );

  renderLinePaths(
    ctx,
    transform,
    lines,
    lineStyle,
    fitLineStroke,
    clippedRanges,
    clippings,
    shouldClip && style.fit.line.visible,
  );
}
