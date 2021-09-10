/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../utils/common';
import { Logger } from '../utils/logger';
import { colorToRgba, combineColors, getHighContrastTextColor } from './color_calcs';
import { TextContrastRatio } from './text_utils';

const COLOR_WHITE: Color = 'rgba(255,255,255,1)';
/**
 * Determine the color for the text hinging on the parameters of maximizeContrast, shapeFillColor and backgroundColor
 * @internal
 */
export function fillTextColor(
  textColor: Color,
  maximizeContrast: boolean,
  minContrastRatio: TextContrastRatio,
  shapeFillColor: Color,
  backgroundColor?: Color,
): string {
  if (!maximizeContrast) {
    return textColor;
  }
  const isBackgroundTransparent = backgroundColor !== undefined && colorToRgba(backgroundColor)[3] < 1;
  if (backgroundColor && isBackgroundTransparent) {
    Logger.expected(`Text contrast requires a opaque background color`, 'opaque color', backgroundColor);
  }
  const background = backgroundColor && !isBackgroundTransparent ? backgroundColor : COLOR_WHITE;

  // combine shape and background colors if shape has transparency
  const blendedBackground = combineColors(shapeFillColor, background);

  return getHighContrastTextColor(textColor, blendedBackground, minContrastRatio);
}
