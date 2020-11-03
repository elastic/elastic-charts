/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { SeriesKey } from '../../../../commons/series_id';
import { Circle, Stroke, Fill, Rect } from '../../../../geoms/types';
import { Rotation } from '../../../../utils/commons';
import { Dimensions } from '../../../../utils/dimensions';
import { PointGeometry } from '../../../../utils/geometry';
import { PointStyle, GeometryStateStyle } from '../../../../utils/themes/theme';
import { renderCircle } from './primitives/arc';
import { buildPointStyles } from './styles/point';
import { withPanelTransform } from './utils/panel_transform';

/**
 * Renders points from single series
 *
 * @internal
 */
export function renderPoints(
  ctx: CanvasRenderingContext2D,
  points: PointGeometry[],
  themeStyle: PointStyle,
  geometryStateStyle: GeometryStateStyle,
) {
  points
    .map<[Circle, Fill, Stroke]>((point) => {
      const { x, y, color, radius: pointRadius, transform, styleOverrides } = point;
      const { fill, stroke, radius } = buildPointStyles(
        color,
        themeStyle,
        geometryStateStyle,
        pointRadius,
        styleOverrides,
      );

      const circle: Circle = {
        x: x + transform.x,
        y: y + transform.y,
        radius,
      };

      return [circle, fill, stroke];
    })
    .sort(([{ radius: a }], [{ radius: b }]) => b - a)
    .forEach((args) => renderCircle(ctx, ...args));
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
    .map<[Circle, Fill, Stroke, Dimensions]>((point) => {
      const {
        x,
        y,
        color,
        radius: pointRadius,
        transform,
        styleOverrides,
        seriesIdentifier: { key },
        panel,
      } = point;
      const { fill, stroke, radius } = buildPointStyles(
        color,
        themeStyles[key],
        geometryStateStyles[key],
        pointRadius,
        styleOverrides,
      );

      const circle: Circle = {
        x: x + transform.x,
        y,
        radius,
      };

      return [circle, fill, stroke, panel];
    })
    .sort(([{ radius: a }], [{ radius: b }]) => b - a)
    .forEach(([circle, fill, stroke, panel]) => {
      withPanelTransform(
        ctx,
        panel,
        rotation,
        renderingArea,
        (ctx) => {
          renderCircle(ctx, circle, fill, stroke);
        },
        { area: clippings, shouldClip },
      );
    });
}
