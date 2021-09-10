/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';

import { Color } from '../utils/common';
import { RgbaTuple, RGBATupleToString, RgbTuple, stringToRGB } from './color_library_wrappers';
import { Ratio } from './geometry';
import { TextContrast } from './text_utils';

/** @internal */
export function hueInterpolator(colors: RgbTuple[]) {
  return (d: number) => {
    const index = Math.round(d * 255);
    const [r, g, b, a] = colors[index];
    return colors[index].length === 3 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a ?? 1})`;
  };
}

/** @internal */
export function addOpacity(hexColorString: string, opacity: Ratio) {
  // this is a super imperfect multiplicative alpha blender that assumes a "#rrggbb" or "#rrggbbaa" hexColorString
  // todo roll some proper utility that can handle "rgb(...)", "rgba(...)", "red", {r, g, b} etc.
  return opacity === 1
    ? hexColorString
    : hexColorString.slice(0, 7) +
        (hexColorString.slice(7).length === 0 || parseInt(hexColorString.slice(7, 2), 16) === 255
          ? `00${Math.round(opacity * 255).toString(16)}`.slice(-2) // color was of full opacity
          : `00${Math.round((parseInt(hexColorString.slice(7, 2), 16) / 255) * opacity * 255).toString(16)}`.slice(-2));
}

/** @internal */
export function arrayToLookup(keyFun: (v: any) => any, array: Array<any>) {
  return Object.assign({}, ...array.map((d) => ({ [keyFun(d)]: d })));
}

const rgbaCache: Map<string | undefined, RgbaTuple> = new Map();

function colorToRgba(color: Color): RgbaTuple {
  const cachedValue = rgbaCache.get(color);
  if (cachedValue === undefined) {
    const newValue = chroma(color).rgba();
    rgbaCache.set(color, newValue);
    return newValue;
  }
  return cachedValue;
}

/** If the user specifies the background of the container in which the chart will be on, we can use that color
 * and make sure to provide optimal contrast
 * @internal
 */
export function combineColors(foregroundColor: Color, backgroundColor: Color): Color {
  const [red1, green1, blue1, alpha1] = colorToRgba(foregroundColor);
  const [red2, green2, blue2, alpha2] = colorToRgba(backgroundColor);

  // combine colors only if foreground has transparency
  if (alpha1 === 1) {
    return foregroundColor;
  }

  // For reference on alpha calculations:
  // https://en.wikipedia.org/wiki/Alpha_compositing
  const combinedAlpha = alpha1 + alpha2 * (1 - alpha1);

  if (combinedAlpha === 0) {
    return 'rgba(0,0,0,0)';
  }

  const combinedRed = Math.round((red1 * alpha1 + red2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  const combinedGreen = Math.round((green1 * alpha1 + green2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  const combinedBlue = Math.round((blue1 * alpha1 + blue2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  const rgba: RgbTuple = [combinedRed, combinedGreen, combinedBlue, combinedAlpha];

  return RGBATupleToString(rgba);
}

const validCache: Map<string | undefined, boolean> = new Map();

/**
 * Return true if the color is a valid CSS color, false otherwise
 * @param color a color written in string
 * @internal
 */
export function isColorValid(color?: string): color is Color {
  const cachedValue = validCache.get(color);
  if (cachedValue === undefined) {
    const newValue = Boolean(color) && chroma.valid(color);
    validCache.set(color, newValue);
    return newValue;
  }
  return cachedValue;
}

/**
 * Adjust the text color in cases black and white can't reach ideal 4.5 ratio
 * @internal
 */
export function makeHighContrastColor(foreground: Color, background: Color, ratio = 4.5): Color {
  // determine the lightness factor of the background color to determine whether to lighten or darken the foreground
  const lightness = chroma(background).get('hsl.l');
  let highContrastTextColor = foreground;
  const originalhighContrastTextColor = foreground;
  const isBackgroundDark = colorIsDark(background);
  // determine whether white or black text is ideal contrast vs a grey that just passes the ratio
  if (isBackgroundDark && chroma.deltaE('black', foreground) === 0) {
    highContrastTextColor = '#fff';
  } else if (lightness > 0.5 && chroma.deltaE('white', foreground) === 0) {
    highContrastTextColor = '#000';
  }
  const precision = 1e8;
  let contrast = getContrast(highContrastTextColor, background);
  // brighten and darken the text color if not meeting the ratio
  while (contrast < ratio) {
    highContrastTextColor = isBackgroundDark
      ? chroma(highContrastTextColor).brighten().toString()
      : chroma(highContrastTextColor).darken().toString();
    const scaledOldContrast = Math.round(contrast * precision) / precision;
    contrast = getContrast(highContrastTextColor, background);
    const scaledContrast = Math.round(contrast * precision) / precision;
    // catch if the ideal contrast may not be possible, switch to the other extreme color contrast
    if (scaledOldContrast === scaledContrast) {
      const contrastColor =
        originalhighContrastTextColor === 'rgba(255, 255, 255, 1)' ? 'rgba(0, 0 , 0, 1)' : 'rgba(255, 255, 255, 1)';
      // make sure the new text color hits the ratio, if not, then return the scaledContrast since we tried earlier
      return getContrast(contrastColor, background) > ratio ? contrastColor : scaledContrast.toString();
    }
  }
  return highContrastTextColor.toString();
}

/**
 * show contrast amount
 * @internal
 */
export function getContrast(foregroundColor: string | chroma.Color, backgroundColor: string | chroma.Color): number {
  return chroma.contrast(foregroundColor, backgroundColor);
}

/**
 * determines if the color is dark based on the luminance
 * @internal
 */
export function colorIsDark(color: Color): boolean {
  const luminance = chroma(color).luminance();
  return luminance < 0.2;
}

/**
 * inverse color for text
 * @internal
 */
export function getTextColorIfTextInvertible(
  textColor: Color,
  backgroundColor: Color,
  textContrast: TextContrast,
): Color {
  const inverseForContrast = colorIsDark(textColor) === colorIsDark(backgroundColor);
  const { r: tr, g: tg, b: tb, opacity: to } = stringToRGB(textColor);
  if (!textContrast) {
    return inverseForContrast
      ? to === undefined
        ? `rgb(${255 - tr}, ${255 - tg}, ${255 - tb})`
        : `rgba(${255 - tr}, ${255 - tg}, ${255 - tb}, ${to})`
      : textColor;
  }
  if (textContrast === true) {
    return inverseForContrast
      ? to === undefined
        ? makeHighContrastColor(`rgb(${255 - tr}, ${255 - tg}, ${255 - tb})`, backgroundColor)
        : makeHighContrastColor(`rgba(${255 - tr}, ${255 - tg}, ${255 - tb}, ${to})`, backgroundColor)
      : makeHighContrastColor(textColor, backgroundColor);
  } else if (typeof textContrast === 'number') {
    return inverseForContrast
      ? to === undefined
        ? makeHighContrastColor(`rgb(${255 - tr}, ${255 - tg}, ${255 - tb})`, backgroundColor, textContrast)
        : makeHighContrastColor(`rgba(${255 - tr}, ${255 - tg}, ${255 - tb}, ${to})`, backgroundColor, textContrast)
      : makeHighContrastColor(textColor, backgroundColor, textContrast);
  }
  return 'black'; // this should never happen; added it as previously function return type included undefined; todo
}

/**
 * This function generates color for non-occluded text rendering directly on the
 * paper, with possible background color, ie. not on some data ink
 *
 * @internal
 */
export function getOnPaperColorSet(textColor: Color, sectorLineStroke: Color, containerBackgroundColor?: Color) {
  // determine the ideal contrast color for the link labels
  const validBackgroundColor = isColorValid(containerBackgroundColor)
    ? containerBackgroundColor
    : 'rgba(255, 255, 255, 0)';
  const contrastTextColor = containerBackgroundColor
    ? makeHighContrastColor(textColor, validBackgroundColor)
    : textColor;
  const strokeColor = containerBackgroundColor
    ? makeHighContrastColor(sectorLineStroke, validBackgroundColor)
    : undefined;
  return { contrastTextColor, strokeColor };
}
