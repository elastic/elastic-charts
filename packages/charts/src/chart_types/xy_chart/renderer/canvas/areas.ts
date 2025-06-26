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
  type GeometryHighlightState,
  getGeometryHighlightState,
  type AreaGeometry,
  type PerPanel,
} from '../../../../utils/geometry';

/** @internal */
export function renderAreas(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  areas: Array<PerPanel<AreaGeometry>>,
  rotation: Rotation,
  renderingArea: Dimensions,
  highlightedLegendItem?: LegendItem,
) {
  const sortedRenderingAreas = areas.reduce<{
    dimmed: { stacked: PerPanel<AreaGeometry>[]; nonStacked: PerPanel<AreaGeometry>[] };
    focused: { stacked: PerPanel<AreaGeometry>[]; nonStacked: PerPanel<AreaGeometry>[] };
    default: { stacked: PerPanel<AreaGeometry>[]; nonStacked: PerPanel<AreaGeometry>[] };
  }>(
    (acc, area) => {
      const highlightState = getGeometryHighlightState(area.value.seriesIdentifier.key, highlightedLegendItem);
      acc[highlightState][area.value.isStacked ? 'stacked' : 'nonStacked'][area.value.isStacked ? 'unshift' : 'push'](
        area,
      );
      return acc;
    },
    {
      dimmed: { stacked: [], nonStacked: [] },
      focused: { stacked: [], nonStacked: [] },
      default: { stacked: [], nonStacked: [] },
    },
  );

  withContext(ctx, () => {
    renderAreasGroup(ctx, imgCanvas, rotation, renderingArea, sortedRenderingAreas.default.stacked, 'default');
    renderAreasGroup(ctx, imgCanvas, rotation, renderingArea, sortedRenderingAreas.default.nonStacked, 'default');

    renderAreasGroup(ctx, imgCanvas, rotation, renderingArea, sortedRenderingAreas.dimmed.stacked, 'dimmed');
    renderAreasGroup(ctx, imgCanvas, rotation, renderingArea, sortedRenderingAreas.dimmed.nonStacked, 'dimmed');

    renderAreasGroup(ctx, imgCanvas, rotation, renderingArea, sortedRenderingAreas.focused.stacked, 'focused');
    renderAreasGroup(ctx, imgCanvas, rotation, renderingArea, sortedRenderingAreas.focused.nonStacked, 'focused');
  });
}

function renderAreasGroup(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  rotation: Rotation,
  renderingArea: Dimensions,
  areas: PerPanel<AreaGeometry>[],
  highlighedState: GeometryHighlightState,
) {
  areas.forEach(({ panel, value: geom }) => {
    const clippings = getPanelClipping(panel, rotation);
    if (geom.style.area.visible) {
      withPanelTransform(
        ctx,
        panel,
        rotation,
        renderingArea,
        () => renderArea(ctx, imgCanvas, geom, clippings, highlighedState),
        { area: clippings, shouldClip: true },
      );
    }

    if (geom.style.line.visible) {
      withPanelTransform(
        ctx,
        panel,
        rotation,
        renderingArea,
        () => renderAreaLines(ctx, geom, clippings, highlighedState),
        { area: clippings, shouldClip: true },
      );
    }
    withPanelTransform(
      ctx,
      panel,
      rotation,
      renderingArea,
      () =>
        renderPoints(
          ctx,
          geom.points,
          highlighedState,
          geom.style.point,
          geom.style.line.strokeWidth,
          geom.minPointDistance,
          geom.style.pointVisibilityMinDistance,
          // has a connecting line only if is fit and there are more than one point on the chart
          geom.hasFit && geom.points.length > 1,
        ),
      { area: clippings, shouldClip: geom.points[0]?.value.mark !== null },
    );
  });
}

function renderArea(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  geometry: AreaGeometry,
  clippings: Rect,
  highlightState: GeometryHighlightState,
) {
  const { area, color, transform, style, clippedRanges, shouldClip } = geometry;
  const areaFill = buildAreaStyles(ctx, imgCanvas, color, style.area, highlightState);

  const fitAreaFillThemeStyle = { ...style.fit.area, dimmed: style.area.dimmed };
  const fitAreaFill = buildAreaStyles(ctx, imgCanvas, color, fitAreaFillThemeStyle, highlightState);

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
  clippings: Rect,
  highlightState: GeometryHighlightState,
) {
  const { lines, color, transform, style, clippedRanges, shouldClip } = geometry;

  const lineStyle = buildLineStyles(color, style.line, highlightState);

  const fitLineThemeStyle = {
    ...style.fit.line,
    strokeWidth: style.line.strokeWidth,
    dimmed: style.line.dimmed,
    focused: style.line.focused,
  };
  const fitLineStyle = buildLineStyles(color, fitLineThemeStyle, highlightState);

  renderLinePaths(
    ctx,
    transform,
    lines,
    lineStyle,
    fitLineStyle,
    clippedRanges,
    clippings,
    shouldClip && style.fit.line.visible,
  );
}
