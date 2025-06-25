/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from '../../../../../common/color_library_wrappers';
import type { Color } from '../../../../../common/colors';
import type { Fill } from '../../../../../geoms/types';
import type { ColorVariant } from '../../../../../utils/common';
import { getColorFromVariant } from '../../../../../utils/common';
import type { GeometryHighlightState } from '../../../../../utils/geometry';
import type { AreaStyle, TexturedStyles } from '../../../../../utils/themes/theme';
import { getTextureStyles } from '../../../utils/texture';

/**
 * Returns the rendering properties for an area. If a fill color is specified in the
 * themeAreaStyle parameter, it will override the provided seriesColor.
 *
 * @param ctx - The canvas rendering context.
 * @param imgCanvas - The image canvas used for textures.
 * @param seriesColor - The base color or color variant for the area.
 * @param themeAreaStyle - The style configuration for the area.
 * @param highlightState - The current highlight state of the geometry.
 * @internal
 */
export function buildAreaStyles(
  ctx: CanvasRenderingContext2D,
  imgCanvas: HTMLCanvasElement,
  seriesColor: Color | ColorVariant,
  themeAreaStyle: AreaStyle,
  highlightState: GeometryHighlightState,
): Fill {
  const isDimmed = highlightState === 'dimmed';
  const fillColor = isDimmed && 'fill' in themeAreaStyle.dimmed ? themeAreaStyle.dimmed.fill : seriesColor;
  const opacity =
    isDimmed && 'opacity' in themeAreaStyle.dimmed ? themeAreaStyle.dimmed.opacity : themeAreaStyle.opacity;

  const texture = themeAreaStyle.texture
    ? getTextureStyles(
        ctx,
        imgCanvas,
        fillColor,
        opacity,
        getTextureStyleFromFocusState(themeAreaStyle.texture, themeAreaStyle.dimmed, highlightState),
      )
    : undefined;

  const color = overrideOpacity(
    colorToRgba(getColorFromVariant(fillColor, themeAreaStyle.fill)),
    (currentColorOpacity) => currentColorOpacity * opacity,
  );

  return {
    color,
    texture,
  };
}

function getTextureStyleFromFocusState(
  textureStyle: TexturedStyles,
  themeDimmedStyle: AreaStyle['dimmed'],
  highlightState: GeometryHighlightState,
): TexturedStyles {
  if (highlightState !== 'dimmed') {
    return textureStyle;
  }
  if ('opacity' in themeDimmedStyle) {
    return {
      ...textureStyle,
      opacity: themeDimmedStyle.opacity,
    };
  }
  return {
    ...textureStyle,
    opacity: themeDimmedStyle.texture.opacity,
  };
}
