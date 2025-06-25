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
import type { GeometryHighlightState } from '../../../../../utils/geometry';
import type { LineStyle } from '../../../../../utils/themes/theme';

/**
 * Returns the rendering properties for a line, including color, width, and dash pattern.
 * The line color and style can be overridden by the themeLineStyle and highlightState parameters.
 * @param seriesColor - The base color assigned to the line series.
 * @param themeLineStyle - The theme style configuration for the line series.
 * @param highlightState - The highlight state of the geometry (e.g., dimmed, focused).
 * @internal
 */
export function buildLineStyles(
  seriesColor: string,
  themeLineStyle: LineStyle,
  highlightState: GeometryHighlightState,
): Stroke {
  const isDimmed = highlightState === 'dimmed';
  const isFocused = highlightState === 'focused';

  const strokeColor = isDimmed && 'stroke' in themeLineStyle.dimmed ? themeLineStyle.dimmed.stroke : seriesColor;
  const opacity =
    isDimmed && 'opacity' in themeLineStyle.dimmed ? themeLineStyle.dimmed.opacity : themeLineStyle.opacity;
  const width =
    isDimmed && 'strokeWidth' in themeLineStyle.dimmed
      ? themeLineStyle.dimmed.strokeWidth
      : isFocused && 'strokeWidth' in themeLineStyle.focused
        ? themeLineStyle.focused.strokeWidth
        : themeLineStyle.strokeWidth;

  const color = overrideOpacity(
    colorToRgba(getColorFromVariant(strokeColor, themeLineStyle.stroke)),
    (currentColorOpacity) => currentColorOpacity * opacity,
  );
  return {
    color,
    width,
    dash: themeLineStyle.dash,
  };
}
