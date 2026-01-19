/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from '../../../../../common/color_library_wrappers';
import type { Stroke, Fill, Rect } from '../../../../../geoms/types';
import { getColorFromVariant } from '../../../../../utils/common';
import type {
  GeometryStateStyle,
  RectStyle,
  RectBorderStyle,
  SharedGeometryStateStyle,
} from '../../../../../utils/themes/theme';
import { getTextureStyles } from '../../../utils/texture';

/**
 * Return the rendering styles (stroke and fill) for a bar.
 * The full color of the bar will be overwritten by the fill color
 * of the themeRectStyle parameter if present.
 * The stroke color of the bar will be overwritten by the stroke color
 * of the themeRectBorderStyle parameter if present.
 * @internal
 */
export function buildBarStyle(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  baseColor: string,
  themeRectStyle: RectStyle,
  themeRectBorderStyle: RectBorderStyle,
  geometryStateStyle: GeometryStateStyle,
  sharedStyle: SharedGeometryStateStyle,
  rect: Rect,
): { fill: Fill; stroke: Stroke } {
  // Check if dimmed by comparing to the unhighlighted style reference
  const isDimmed = geometryStateStyle === sharedStyle.unhighlighted;
  const useDimmedColor = isDimmed && themeRectStyle.dimmed && 'fill' in themeRectStyle.dimmed;

  const fillBaseColor =
    useDimmedColor && themeRectStyle.dimmed && 'fill' in themeRectStyle.dimmed
      ? getColorFromVariant(baseColor, themeRectStyle.dimmed.fill)
      : getColorFromVariant(baseColor, themeRectStyle.fill);

  const textureOpacity =
    isDimmed && themeRectStyle.dimmed && 'texture' in themeRectStyle.dimmed && themeRectStyle.dimmed.texture
      ? themeRectStyle.dimmed.texture.opacity
      : geometryStateStyle.opacity;

  const texture = themeRectStyle.texture
    ? getTextureStyles(ctx, imgCanvas, baseColor, textureOpacity, themeRectStyle.texture)
    : undefined;

  const fillColor = overrideOpacity(
    colorToRgba(fillBaseColor),
    (opacity) => opacity * themeRectStyle.opacity * (useDimmedColor ? 1 : geometryStateStyle.opacity),
  );
  const fill: Fill = {
    color: fillColor,
    texture,
  };

  const strokeColor = overrideOpacity(
    colorToRgba(getColorFromVariant(baseColor, themeRectBorderStyle.stroke)),
    (opacity) => opacity * geometryStateStyle.opacity * (themeRectBorderStyle.strokeOpacity ?? themeRectStyle.opacity),
  );
  const stroke: Stroke = {
    color: strokeColor,
    width:
      themeRectBorderStyle.visible && rect.height > themeRectBorderStyle.strokeWidth
        ? themeRectBorderStyle.strokeWidth
        : 0,
  };
  return { fill, stroke };
}
