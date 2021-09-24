/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { combineColors, highContrastColor } from './color_calcs';
import { colorToRgba, RGBATupleToString } from './color_library_wrappers';
import { Color, Colors } from './colors';

/** limit used to return fallback color */
const TRANSPARENT_LIMIT = 0.1;

/**
 * Determine the text color hinging on the parameters of maximizeColorContrast, foreground and container foreground
 * returns high contrast color blend from fg anf bg when suitable, otherwise returns fallback color
 *
 * @internal
 */
export function fillTextColor(
  foreground: Color | null,
  background: Color = Colors.Transparent.keyword,
  fallbackColor?: Color,
): Color {
  const backgroundRGBA = colorToRgba(background);
  if (backgroundRGBA[3] < TRANSPARENT_LIMIT && !foreground && fallbackColor) return fallbackColor;

  if (foreground) {
    const foregroundRGBA = colorToRgba(foreground);

    if (backgroundRGBA[3] < TRANSPARENT_LIMIT) {
      if (foregroundRGBA[3] < TRANSPARENT_LIMIT && fallbackColor) return fallbackColor;
      // combine it with white if semi-transparent
      const fgBlend = foregroundRGBA[3] < 1 ? combineColors(foregroundRGBA, Colors.White.rgba) : foregroundRGBA;
      // only use foreground
      return RGBATupleToString(highContrastColor(fgBlend));
    }

    // combine it with white if semi-transparent
    const bgBlend = combineColors(backgroundRGBA, Colors.White.rgba);
    const blendedFgBg = combineColors(foregroundRGBA, bgBlend);
    return RGBATupleToString(highContrastColor(blendedFgBg));
  }

  if (backgroundRGBA[3] < TRANSPARENT_LIMIT && fallbackColor) return fallbackColor;

  // combine it with white if semi-transparent
  const bgBlend = combineColors(backgroundRGBA, Colors.White.rgba);
  return RGBATupleToString(highContrastColor(bgBlend));
}
