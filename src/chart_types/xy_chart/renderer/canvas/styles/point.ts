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
 * under the License. */

import { PointStyle, GeometryStateStyle } from '../../../../../utils/themes/theme';
import { stringToRGB, OpacityFn } from '../../../../partition_chart/layout/utils/color_library_wrappers';
import { Fill, Stroke } from '../../../../../geoms/types';
import { mergePartial, getColorFromVariant } from '../../../../../utils/commons';

/**
 * Return the fill, stroke and radius styles for a point geometry.
 * The color value is used for stroke or fill if they are undefind in the theme PointStyle.
 * If an override style is available it will overrides the style or the radius of the point.
 * @param baseColor the series color
 * @param themePointStyle the theme style or the merged point style if a custom PointStyle is applied
 * @param geometryStateStyle the state style of the geometry
 * @param overrides (optional) an override PointStyle
 * @internal
 */
export function buildPointStyles(
  baseColor: string,
  themePointStyle: PointStyle,
  geometryStateStyle: GeometryStateStyle,
  pointRadius: number,
  overrides?: Partial<PointStyle>,
): { fill: Fill; stroke: Stroke; radius: number } {
  const pointStyle = mergePartial(themePointStyle, overrides);
  const fillOpacity: OpacityFn = (opacity) => opacity * pointStyle.opacity * geometryStateStyle.opacity;
  const fillColor = stringToRGB(getColorFromVariant(baseColor, pointStyle.fill), fillOpacity);
  const fill: Fill = {
    color: fillColor,
  };

  const strokeOpacity: OpacityFn = (opacity) => opacity * pointStyle.opacity * geometryStateStyle.opacity;
  const strokeColor = stringToRGB(getColorFromVariant(baseColor, pointStyle.stroke), strokeOpacity);
  const stroke: Stroke = {
    color: strokeColor,
    width: pointStyle.strokeWidth,
  };

  const radius = getRadius(pointRadius, themePointStyle.radius, overrides?.radius);
  return { fill, stroke, radius };
}

/** @internal */
export function getRadius(pointRadius: number, themeRadius: number, overrideRadius?: number) {
  if (overrideRadius !== undefined) {
    return overrideRadius;
  }

  return Math.max(pointRadius, themeRadius);
}
