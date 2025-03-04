/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, overrideOpacity } from '../../../../../common/color_library_wrappers';
import type { Stroke } from '../../../../../geoms/types';
import { getColorFromVariant } from '../../../../../utils/common';
import type { GeometryStateStyle, LineStyle } from '../../../../../utils/themes/theme';

/**
 * Return the rendering props for a line. The color of the line will be overwritten
 * by the stroke color of the themeLineStyle parameter if present
 * @param baseColor the assigned color of the line for this series
 * @param themeLineStyle the theme style for the line series
 * @param geometryStateStyle the highlight geometry style
 * @internal
 */
export function buildLineStyles(
  baseColor: string,
  themeLineStyle: LineStyle,
  geometryStateStyle: GeometryStateStyle,
): Stroke {
  const strokeColor = overrideOpacity(
    colorToRgba(getColorFromVariant(baseColor, themeLineStyle.stroke)),
    (opacity) => opacity * themeLineStyle.opacity * geometryStateStyle.opacity,
  );
  return {
    color: strokeColor,
    width: themeLineStyle.strokeWidth,
    dash: themeLineStyle.dash,
  };
}
