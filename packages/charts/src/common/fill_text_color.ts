/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';

import { Logger } from '../utils/logger';
import { Color, Colors } from './color';
import {
  colorIsDark,
  combineColors,
  getTextColorIfTextInvertible,
  isColorValid,
  makeHighContrastColor,
} from './color_calcs';
import { TextContrast } from './text_utils';

function isBackgroundColorValid(color: string | undefined, logWarning: boolean): color is string {
  const bgColorAlpha = isColorValid(color) ? chroma(color).alpha() : 1;
  if (isColorValid(color) && bgColorAlpha >= 1) {
    return true;
  }
  if (logWarning && bgColorAlpha < 1) {
    Logger.expected('Text contrast requires a background color with an alpha value of 1', 1, bgColorAlpha);
  }
  if (logWarning && color !== 'transparent') {
    Logger.warn(`Invalid background color "${String(color)}"`);
  }
  return false;
}

/**
 * Determine the color for the text hinging on the parameters of textInvertible and textContrast
 * @internal
 */
export function fillTextColor(
  textColor: Color,
  textInvertible: boolean,
  textContrast: TextContrast,
  shapeFillColor: string,
  backgroundColor?: Color,
): string {
  if (!isBackgroundColorValid(backgroundColor, true)) {
    return getTextColorIfTextInvertible(
      colorIsDark(shapeFillColor),
      colorIsDark(textColor),
      textColor,
      false,
      Colors.White.rgba, // never used
    );
  }

  const adjustedTextColor: string | undefined = textColor;
  const containerBackground = combineColors(shapeFillColor, backgroundColor);
  const textShouldBeInvertedAndTextContrastIsFalse = textInvertible && !textContrast;
  const textShouldBeInvertedAndTextContrastIsSetToTrue = textInvertible && typeof textContrast !== 'number';
  const textContrastIsSetToANumberValue = typeof textContrast === 'number';
  const textShouldNotBeInvertedButTextContrastIsDefined = textContrast && !textInvertible;

  // change the contrast for the inverted slices
  if (textShouldBeInvertedAndTextContrastIsFalse || textShouldBeInvertedAndTextContrastIsSetToTrue) {
    const backgroundIsDark = colorIsDark(combineColors(shapeFillColor, backgroundColor));
    const specifiedTextColorIsDark = colorIsDark(textColor);
    return getTextColorIfTextInvertible(
      backgroundIsDark,
      specifiedTextColorIsDark,
      textColor,
      textContrast,
      containerBackground,
    );
    // if textContrast is a number then take that into account or if textInvertible is set to false
  }
  if (textContrastIsSetToANumberValue || textShouldNotBeInvertedButTextContrastIsDefined) {
    return makeHighContrastColor(adjustedTextColor, containerBackground);
  }

  return adjustedTextColor;
}
