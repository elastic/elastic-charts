/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../../../../common/color';
import { OpacityFn, stringToRGB } from '../../../../../common/color_library_wrappers';
import { Fill } from '../../../../../geoms/types';
import { ColorVariant, getColorFromVariant } from '../../../../../utils/common';
import { GeometryStateStyle, AreaStyle } from '../../../../../utils/themes/theme';
import { getTextureStyles } from '../../../utils/texture';

/**
 * Return the rendering props for an area. The color of the area will be overwritten
 * by the fill color of the themeAreaStyle parameter if present
 * @param baseColor the assigned color of the area for this series
 * @param themeAreaStyle the theme style for the area series
 * @param geometryStateStyle the highlight geometry style
 * @internal
 */
export function buildAreaStyles(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  baseColor: Color | ColorVariant,
  themeAreaStyle: AreaStyle,
  geometryStateStyle: GeometryStateStyle,
): Fill {
  const fillOpacity: OpacityFn = (opacity, seriesOpacity = themeAreaStyle.opacity) =>
    opacity * seriesOpacity * geometryStateStyle.opacity;
  const texture = getTextureStyles(ctx, imgCanvas, baseColor, fillOpacity, themeAreaStyle.texture);
  const color = stringToRGB(getColorFromVariant(baseColor, themeAreaStyle.fill), fillOpacity);

  return {
    color,
    texture,
  };
}
