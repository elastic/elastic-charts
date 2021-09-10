/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';

import { Color } from '../utils/common';
import { Logger } from '../utils/logger';
import { combineColors, getHighContrastTextColor } from './color_calcs';
import { TextContrastRatio } from './text_utils';

const COLOR_WHITE: Color = 'rgba(255,255,255,1)';
/**
 * Determine the color for the text hinging on the parameters of textInvertible and textContrast
 * @internal
 */
export function fillTextColor(
  textColor: Color,
  maximizeContrast: boolean,
  minContrastRatio: TextContrastRatio,
  shapeFillColor: Color,
  backgroundColor: Color = COLOR_WHITE,
): string {
  if (!maximizeContrast) {
    return textColor;
  }
  const isBackgroundOpaque =
    backgroundColor !== 'transparent' && chroma.valid(backgroundColor) && chroma(backgroundColor).alpha() === 1;

  if (!isBackgroundOpaque) {
    Logger.expected(
      `Text contrast requires a background color with an alpha value of 1, using ${COLOR_WHITE} as default`,
      1,
      backgroundColor,
    );
  }
  // combine shape and background colors if shape has transparency
  const opaqueBackground = combineColors(shapeFillColor, isBackgroundOpaque ? backgroundColor : COLOR_WHITE);

  return getHighContrastTextColor(textColor, opaqueBackground, minContrastRatio);
}
