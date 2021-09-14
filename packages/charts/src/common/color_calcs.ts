/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  brightenColor,
  darkenColor,
  getContrast,
  getLightness,
  getLuminance,
  RgbaTuple,
  RGBATupleToString,
  RgbTuple,
} from './color_library_wrappers';

/** @internal */
export function hueInterpolator(colors: RgbTuple[]) {
  return (d: number) => RGBATupleToString(colors[Math.round(d * 255)]);
}

/** @internal */
export function arrayToLookup(keyFun: (v: any) => any, array: Array<any>) {
  return Object.assign({}, ...array.map((d) => ({ [keyFun(d)]: d })));
}

/** If the user specifies the background of the container in which the chart will be on, we can use that color
 * and make sure to provide optimal contrast
 * @internal
 */
export function combineColors(
  [red1, green1, blue1, alpha1]: RgbaTuple,
  [red2, green2, blue2, alpha2]: RgbaTuple,
): RgbaTuple {
  // combine colors only if foreground has transparency
  if (alpha1 === 1) {
    return [red1, green1, blue1, alpha1];
  }

  // For reference on alpha calculations:
  // https://en.wikipedia.org/wiki/Alpha_compositing
  const combinedAlpha = alpha1 + alpha2 * (1 - alpha1);

  if (combinedAlpha === 0) {
    return [0, 0, 0, 0];
  }

  const combinedRed = Math.round((red1 * alpha1 + red2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  const combinedGreen = Math.round((green1 * alpha1 + green2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  const combinedBlue = Math.round((blue1 * alpha1 + blue2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  return [combinedRed, combinedGreen, combinedBlue, combinedAlpha];
}

const WCAG_AA_CONTRAST_RATIO = 4.5;

/**
 * Adjust the text color in cases black and white can't reach ideal 4.5 ratio
 * @internal
 */
export function makeHighContrastColor(foreground: RgbaTuple, background: RgbaTuple): RgbaTuple {
  // determine the lightness factor of the background color to determine whether to lighten or darken the foreground
  const lightness = getLightness(background);
  let highContrastTextColor = foreground;
  const originalHighContrastTextColor = foreground;
  const isBackgroundDark = colorIsDark(background);
  // determine whether white or black text is ideal contrast vs a grey that just passes the ratio
  if (isBackgroundDark && areColorEqual(foreground, [0, 0, 0, 1])) {
    highContrastTextColor = [255, 255, 255, 1];
  } else if (lightness > 0.5 && areColorEqual(foreground, [255, 255, 255, 1])) {
    highContrastTextColor = [0, 0, 0, 1];
  }
  const precision = 1e8;
  let contrast = getContrast(highContrastTextColor, background);
  // brighten and darken the text color if not meeting the ratio
  while (contrast < WCAG_AA_CONTRAST_RATIO) {
    highContrastTextColor = isBackgroundDark
      ? brightenColor(highContrastTextColor)
      : darkenColor(highContrastTextColor);

    const scaledOldContrast = Math.round(contrast * precision) / precision;
    contrast = getContrast(highContrastTextColor, background);
    const scaledContrast = Math.round(contrast * precision) / precision;
    // catch if the ideal contrast may not be possible, switch to the other extreme color contrast
    if (scaledOldContrast === scaledContrast) {
      const contrastColor: RgbaTuple = areColorEqual(originalHighContrastTextColor, [255, 255, 255, 1])
        ? [0, 0, 0, 1]
        : [255, 255, 255, 1];
      // make sure the new text color hits the ratio, if not, then return the scaledContrast since we tried earlier
      return getContrast(contrastColor, background) > WCAG_AA_CONTRAST_RATIO ? contrastColor : highContrastTextColor;
    }
  }
  return highContrastTextColor;
}

/**
 * determines if the color is dark based on the luminance
 * @internal
 */
export function colorIsDark(color: RgbaTuple): boolean {
  return getLuminance(color) < 0.2;
}

function areColorEqual(c1: RgbaTuple, c2: RgbaTuple) {
  return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
}
