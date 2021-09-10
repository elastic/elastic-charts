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
  const background =
    backgroundColor && isColorOpaque(backgroundColor, 'backgroundColor') ? backgroundColor : COLOR_WHITE;
  // combine shape and background colors if shape has transparency
  const opaqueBackground = combineColors(shapeFillColor, background);

  return getHighContrastTextColor(textColor, opaqueBackground, minContrastRatio);
}

function isColorOpaque(color: Color, transparentWarnPropName?: string) {
  const isOpaque = color !== 'transparent' && chroma.valid(color) && chroma(color).alpha() === 1;
  if (!isOpaque && transparentWarnPropName) {
    Logger.expected(
      `Text contrast requires a ${transparentWarnPropName} with an alpha value of 1, using ${COLOR_WHITE} as default`,
      1,
      color,
    );
  }
  return isOpaque;
}
