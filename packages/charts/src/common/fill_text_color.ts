/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { combineColors, highContrastColor } from './color_calcs';
import { colorToRgba, RGBATupleToString } from './color_library_wrappers';
import { Color } from './colors';

/**
 * Determine the color for the text hinging on the parameters of maximizeColorContrast, foreground and containerBackground
 * @internal
 */
export function fillTextColor(background: Color, containerBg: Color = 'white'): Color {
  const backgroundRGBA = colorToRgba(background);
  const containerBgRGBA = combineColors(colorToRgba(containerBg), [255, 255, 255, 1]); // combine it with white if semi-transparent
  const blendedFbBg = combineColors(backgroundRGBA, containerBgRGBA);
  return RGBATupleToString(highContrastColor(blendedFbBg));
}
