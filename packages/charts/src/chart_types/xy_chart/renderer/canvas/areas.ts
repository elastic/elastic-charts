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
import { colorToRgba, overrideOpacity } from '../../../../common/color_library_wrappers';
import { LegendItem } from '../../../../common/legend';
import { Fill, Rect, Stroke } from '../../../../geoms/types';
import { withContext } from '../../../../renderers/canvas';
import { ColorVariant, Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { AreaGeometry, PerPanel } from '../../../../utils/geometry';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/utils';
import { getTextureStyles } from '../../utils/texture';

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
    // first render all the areas and lines
    areas.forEach(({ panel, value: geom }) => {
      const clippings = getPanelClipping(panel, rotation);
      if (geom.style.area.visible) {
        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () => renderArea(ctx, imgCanvas, geom, sharedStyle, clippings, highlightedLegendItem),
          { area: clippings, shouldClip: true },
        );
      }
      if (geom.style.line.visible) {
        withPanelTransform(
          ctx,
          panel,
          rotation,
          renderingArea,
          () => renderAreaLines(ctx, geom, sharedStyle, clippings, highlightedLegendItem),
          { area: clippings, shouldClip: true },
        );
      }
    });
    // now we can render the visible points on top of each the areas/lines
    areas.forEach(({ panel, value: { style, seriesIdentifier, points, hasFit, minPointDistance } }) => {
      const geometryStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
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
            hasFit,
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
  sharedStyle: SharedGeometryStateStyle,
  clippings: Rect,
  highlightedLegendItem?: LegendItem,
) {
  const { area, color, transform, seriesIdentifier, style, clippedRanges, shouldClip } = geometry;
  const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
  const areaFill = buildAreaStyles(ctx, imgCanvas, color, style.area, geometryStateStyle);

  const fitAreaFillColor = style.fit.area.fill === ColorVariant.Series ? color : style.fit.area.fill;
  const fitAreaFill: Fill = {
    texture: getTextureStyles(ctx, imgCanvas, fitAreaFillColor, geometryStateStyle.opacity, style.fit.area.texture),
    color: overrideOpacity(
      colorToRgba(fitAreaFillColor),
      (opacity) => opacity * geometryStateStyle.opacity * style.fit.area.opacity,
    ),
  };

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
  sharedStyle: SharedGeometryStateStyle,
  clippings: Rect,
  highlightedLegendItem?: LegendItem,
) {
  const { lines, color, seriesIdentifier, transform, style, clippedRanges, shouldClip } = geometry;
  const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
  const lineStyle = buildLineStyles(color, style.line, geometryStateStyle);

  const fitLineStroke: Stroke = {
    dash: style.fit.line.dash,
    width: style.line.strokeWidth,
    color: overrideOpacity(
      colorToRgba(style.fit.line.stroke === ColorVariant.Series ? color : style.fit.line.stroke),
      (opacity) => opacity * geometryStateStyle.opacity * style.fit.line.opacity,
    ),
  };

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
