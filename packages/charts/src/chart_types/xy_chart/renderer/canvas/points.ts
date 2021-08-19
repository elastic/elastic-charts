/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RgbObject } from '../../../../common/color_library_wrappers';
import { SeriesKey } from '../../../../common/series_id';
import { Circle, Fill, Rect, Stroke } from '../../../../geoms/types';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { PointGeometry } from '../../../../utils/geometry';
import { GeometryStateStyle, PointShape, PointStyle } from '../../../../utils/themes/theme';
import { renderShape } from './primitives/shapes';
import { withPanelTransform } from './utils/panel_transform';

/**
 * Renders points from single series
 *
 * @internal
 */
export function renderPoints(ctx: CanvasRenderingContext2D, points: PointGeometry[], { opacity }: GeometryStateStyle) {
  points
    .slice()
    .sort(({ radius: a }, { radius: b }) => b - a)
    .forEach(({ x, y, radius, transform, style }) => {
      const coordinates = { x: x + transform.x, y: y + transform.y, radius };
      const fill = { color: applyOpacity(style.fill.color, opacity) };
      const stroke = { ...style.stroke, color: applyOpacity(style.stroke.color, opacity) };
      return renderShape(ctx, style.shape, coordinates, fill, stroke);
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
  themeStyles: Record<SeriesKey, PointStyle>,
  geometryStateStyles: Record<SeriesKey, GeometryStateStyle>,
  rotation: Rotation,
  renderingArea: Dimensions,
  clippings: Rect,
  shouldClip: boolean,
) {
  points
    .slice()
    .sort(({ radius: a }, { radius: b }) => b - a)
    .map<[Circle, Fill, Stroke, Dimensions, PointShape]>(
      ({ x, y, radius, transform, style, seriesIdentifier: { key }, panel }) => {
        const { opacity } = geometryStateStyles[key];
        const fill: Fill = { color: applyOpacity(style.fill.color, opacity) };
        const stroke: Stroke = { ...style.stroke, color: applyOpacity(style.stroke.color, opacity) };
        const coordinates: Circle = { x: x + transform.x, y, radius };
        return [coordinates, fill, stroke, panel, style.shape];
      },
    )
    .forEach(([coordinates, fill, stroke, panel, shape]) => {
      withPanelTransform(
        ctx,
        panel,
        rotation,
        renderingArea,
        () => renderShape(ctx, shape, coordinates, fill, stroke),
        { area: clippings, shouldClip },
      );
    });
}

function applyOpacity(color: RgbObject, opacity: number): RgbObject {
  return { ...color, opacity: color.opacity * opacity };
}
