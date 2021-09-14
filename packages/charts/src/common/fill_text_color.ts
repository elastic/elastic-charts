/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../utils/common';
import { Logger } from '../utils/logger';
import { colorIsDark, combineColors, makeHighContrastColor } from './color_calcs';
import { colorToRgba, RgbaTuple, RGBATupleToString } from './color_library_wrappers';

const COLOR_WHITE: RgbaTuple = [255, 255, 255, 1];
/**
 * Determine the color for the text hinging on the parameters of maximizeColorContrast, shapeFillColor and backgroundColor
 * @internal
 */
export function fillTextColor(textColor: Color, shapeFillColor: Color, backgroundColor?: Color): Color {
  const colorRGBA = colorToRgba(textColor);
  const defaultBackgroundRGBA = backgroundColor ? colorToRgba(backgroundColor) : COLOR_WHITE;
  const shapeFillRGBA = colorToRgba(shapeFillColor);

  if (backgroundColor && defaultBackgroundRGBA[3] < 1) {
    Logger.expected(`Text contrast requires a opaque background color`, 'opaque color', backgroundColor);
  }
  // use WHITE if background color is semi transparent
  const backgroundRGBA = backgroundColor && defaultBackgroundRGBA[3] === 1 ? defaultBackgroundRGBA : COLOR_WHITE;

  // combine shape and background colors if shape has transparency
  const blendedBackgroundRGBA = combineColors(shapeFillRGBA, backgroundRGBA);

  const requireInvertedColor = colorIsDark(colorRGBA) === colorIsDark(blendedBackgroundRGBA);

  const highContrastColor = makeHighContrastColor(
    requireInvertedColor ? [255 - colorRGBA[0], 255 - colorRGBA[1], 255 - colorRGBA[2], colorRGBA[3]] : colorRGBA,
    blendedBackgroundRGBA,
  );
  return RGBATupleToString(highContrastColor);
}
