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
import type { GeometryStateStyle, RectStyle, RectBorderStyle } from '../../../../../utils/themes/theme';
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
  rect: Rect,
): { fill: Fill; stroke: Stroke } {
  const texture = getTextureStyles(ctx, imgCanvas, baseColor, geometryStateStyle.opacity, themeRectStyle.texture);
  const fillColor = overrideOpacity(
    colorToRgba(getColorFromVariant(baseColor, themeRectStyle.fill)),
    (opacity) => opacity * themeRectStyle.opacity * geometryStateStyle.opacity,
  );
  const fill: Fill = {
    color: geometryStateStyle.fill ? colorToRgba(geometryStateStyle.fill) : fillColor,
    texture,
  };

  const strokeColor = overrideOpacity(
    colorToRgba(getColorFromVariant(baseColor, themeRectBorderStyle.stroke)),
    (opacity) => opacity * geometryStateStyle.opacity * (themeRectBorderStyle.strokeOpacity ?? themeRectStyle.opacity),
  );
  const stroke: Stroke = {
    color: geometryStateStyle.stroke ? colorToRgba(geometryStateStyle.stroke) : strokeColor,
    width:
      themeRectBorderStyle.visible && rect.height > themeRectBorderStyle.strokeWidth
        ? geometryStateStyle.strokeWidth ?? themeRectBorderStyle.strokeWidth
        : 0,
  };
  return { fill, stroke };
}
