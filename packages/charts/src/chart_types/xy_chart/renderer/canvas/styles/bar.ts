/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, OpacityFn, overrideOpacity } from '../../../../../common/color_library_wrappers';
import { Stroke, Fill, Rect } from '../../../../../geoms/types';
import { getColorFromVariant } from '../../../../../utils/common';
import { GeometryStateStyle, RectStyle, RectBorderStyle } from '../../../../../utils/themes/theme';
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
  const fillOpacity: OpacityFn = (opacity) => opacity * geometryStateStyle.opacity * themeRectStyle.opacity;
  const texture = getTextureStyles(ctx, imgCanvas, baseColor, fillOpacity, themeRectStyle.texture);
  const fillColor = overrideOpacity(colorToRgba(getColorFromVariant(baseColor, themeRectStyle.fill)), fillOpacity);
  const fill: Fill = {
    color: fillColor,
    texture,
  };

  const strokeColor = overrideOpacity(
    colorToRgba(getColorFromVariant(baseColor, themeRectBorderStyle.stroke)),
    (opacity) => opacity * geometryStateStyle.opacity * (themeRectStyle.opacity ?? themeRectBorderStyle.strokeOpacity),
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
