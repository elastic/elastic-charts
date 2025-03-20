/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPanelClipping } from './panel_clipping';
import { renderShape } from './primitives/shapes';
import { withPanelTransform } from './utils/panel_transform';
import { overrideOpacity } from '../../../../common/color_library_wrappers';
import type { SeriesKey } from '../../../../common/series_id';
import type { Circle, Fill, Stroke } from '../../../../geoms/types';
import type { Rotation } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';
import type { PointGeometry } from '../../../../utils/geometry';
import type { GeometryStateStyle, PointStyle } from '../../../../utils/themes/theme';
import { isolatedPointRadius } from '../../rendering/points';

/**
 * Renders points from single series
 *
 * @internal
 */
export function renderPoints(
  ctx: CanvasRenderingContext2D,
  points: PointGeometry[],
  { opacity }: GeometryStateStyle,
  pointStyle: PointStyle,
  isolatedPointStyle: { enabled: boolean } & Omit<PointStyle, 'radius'>,
  lineStrokeWidth: number,
  seriesMinPointDistance: number,
  pointsDistanceVisibilityThreshold: number,
  hasConnectingLine: boolean,
) {
  // seriesMinPointDistance could be Infinity if we don't have points, or we just have a single point per series.
  // In this case the point should be visible if the visibility style is set to `auto`
  const isHiddenOnAuto = pointStyle.visible === 'auto' && seriesMinPointDistance < pointsDistanceVisibilityThreshold;
  const hideDataPoints = pointStyle.visible === 'never' || isHiddenOnAuto;
  const hideIsolatedDataPoints =
    hasConnectingLine || !isolatedPointStyle.enabled || isolatedPointStyle.visible === 'never';

  const useIsolatedPointRadius = hideDataPoints && !hasConnectingLine;
  points.forEach(({ x, y, radius, transform, style, isolated }) => {
    if ((isolated && hideIsolatedDataPoints) || (!isolated && hideDataPoints)) {
      return;
    }

    const coordinates = {
      x: x + transform.x,
      y: y + transform.y,
      radius: isolated ? (useIsolatedPointRadius ? isolatedPointRadius(lineStrokeWidth) : pointStyle.radius) : radius,
    };
    const fill = { color: overrideOpacity(style.fill.color, (fillOpacity) => fillOpacity * opacity) };
    const stroke = {
      ...style.stroke,
      color: overrideOpacity(style.stroke.color, (fillOpacity) => fillOpacity * opacity),
    };
    renderShape(ctx, style.shape, coordinates, fill, stroke);
  });
}

/**
 * Renders points in group from multiple series on a single layer
 *
 * @internal
 */
export function renderPointGroup(
  ctx: CanvasRenderingContext2D,
  points: PointGeometry[],
  geometryStateStyles: Record<SeriesKey, GeometryStateStyle>,
  rotation: Rotation,
  renderingArea: Dimensions,
  shouldClip: boolean,
) {
  points
    .slice()
    .sort(({ radius: a }, { radius: b }) => b - a)
    .forEach(({ x, y, radius, transform, style, seriesIdentifier: { key }, panel }) => {
      const opacity = geometryStateStyles[key]?.opacity ?? 1;
      const fill: Fill = { color: overrideOpacity(style.fill.color, (fillOpacity) => fillOpacity * opacity) };
      const stroke: Stroke = {
        ...style.stroke,
        color: overrideOpacity(style.stroke.color, (fillOpacity) => fillOpacity * opacity),
      };
      const coordinates: Circle = { x: x + transform.x, y, radius };
      const renderer = () => renderShape(ctx, style.shape, coordinates, fill, stroke);
      const clippings = { area: getPanelClipping(panel, rotation), shouldClip };
      withPanelTransform(ctx, panel, rotation, renderingArea, renderer, clippings);
    });
}
