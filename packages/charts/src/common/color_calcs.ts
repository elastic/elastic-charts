/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Required } from 'utility-types';

import { APCAContrast } from './apca_color_contrast';
import type { RgbaTuple, RgbTuple } from './color_library_wrappers';
import { colorToRgba, RGBATupleToString } from './color_library_wrappers';
import type { ColorDefinition } from './colors';
import { Colors } from './colors';
import { getWCAG2ContrastRatio } from './wcag2_color_contrast';

/** @internal */
export function hueInterpolator(colors: RgbTuple[]) {
  return (d: number) => RGBATupleToString(colors[Math.round(d * 255)] ?? Colors.White.rgba);
}

/** @internal */
export function arrayToLookup(keyFun: (v: any) => any, array: Array<any>) {
  return Object.assign({}, ...array.map((d) => ({ [keyFun(d)]: d })));
}

/**
 * Blend a foreground (fg) color with a background (bg) color
 * @internal
 */
export function combineColors([fgR, fgG, fgB, fgA]: RgbaTuple, [bgR, bgG, bgB, bgA]: RgbaTuple): RgbaTuple {
  // combine colors only if foreground has transparency
  if (fgA === 1) {
    return [fgR, fgG, fgB, fgA];
  }

  // For reference on alpha calculations:
  // https://en.wikipedia.org/wiki/Alpha_compositing
  const alpha = fgA + bgA * (1 - fgA);

  if (alpha === 0) {
    return Colors.Transparent.rgba;
  }

  const r = Math.round((fgR * fgA + bgR * bgA * (1 - fgA)) / alpha);
  const g = Math.round((fgG * fgA + bgG * bgA * (1 - fgA)) / alpha);
  const b = Math.round((fgB * fgA + bgB * bgA * (1 - fgA)) / alpha);
  return [r, g, b, alpha];
}

/** @internal */
export interface ColorContrastOptions {
  darkColor?: RgbaTuple;
  lightColor?: RgbaTuple;
}

const getOptionWithDefaults = (options: ColorContrastOptions = {}): Required<ColorContrastOptions> => ({
  darkColor: Colors.Black.rgba,
  lightColor: Colors.White.rgba,
  ...options,
});

function getHighContrastColorWCAG2(background: RgbTuple, options: ColorContrastOptions = {}): HighContrastResult {
  const { lightColor, darkColor } = getOptionWithDefaults(options);
  const wLight = getWCAG2ContrastRatio(lightColor, background);
  const wDark = getWCAG2ContrastRatio(darkColor, background);
  return wLight >= wDark
    ? {
        color: {
          rgba: lightColor,
          keyword: RGBATupleToString(lightColor),
        },
        ratio: wLight,
        shade: 'light',
      }
    : {
        color: {
          rgba: darkColor,
          keyword: RGBATupleToString(darkColor),
        },
        ratio: wDark,
        shade: 'dark',
      };
}

function getHighContrastColorAPCA(background: RgbTuple, options: ColorContrastOptions = {}): HighContrastResult {
  const { lightColor, darkColor } = getOptionWithDefaults(options);
  const wLightText = Math.abs(APCAContrast(background, lightColor));
  const wDarkText = Math.abs(APCAContrast(background, darkColor));

  return wLightText > wDarkText
    ? {
        color: {
          rgba: lightColor,
          keyword: RGBATupleToString(lightColor),
        },
        ratio: wLightText,
        shade: 'light',
      }
    : {
        color: {
          rgba: darkColor,
          keyword: RGBATupleToString(darkColor),
        },
        ratio: wDarkText,
        shade: 'dark',
      };
}

const HIGH_CONTRAST_FN = {
  WCAG2: getHighContrastColorWCAG2,
  WCAG3: getHighContrastColorAPCA,
};

/** @internal */
export interface HighContrastResult {
  color: ColorDefinition;
  ratio: number;
  shade: 'light' | 'dark';
}

/**
 * Use white or black text depending on the high contrast mode used
 * @internal
 */
export function highContrastColor(
  background: RgbTuple,
  mode: keyof typeof HIGH_CONTRAST_FN = 'WCAG2',
  options?: ColorContrastOptions,
): HighContrastResult {
  return HIGH_CONTRAST_FN[mode](background, options);
}

/**
 * Computes the contrast ratio between two colors and determines if a border is needed for sufficient visual separation.
 * If the contrast is below the specified threshold, recommends a border color that has high contrast with both input colors.
 *
 * @param colorA - The first color to compare (can be background, foreground, or any color).
 * @param colorB - The second color to compare.
 * @param options - Optional settings for contrast mode, threshold, and border color preferences.
 *
 * @internal
 */
export function getContrastRecommendation(
  colorA: string,
  colorB: string,
  options: {
    contrastMode?: 'WCAG2' | 'WCAG3';
    contrastThreshold?: number;
    borderOptions?: ColorContrastOptions;
  } = {},
) {
  const {
    contrastMode = 'WCAG2',
    contrastThreshold = 4.5, // WCAG AA standard
    borderOptions,
  } = options;

  const rgbA = colorToRgba(colorA).slice(0, 3) as RgbTuple;
  const rgbB = colorToRgba(colorB).slice(0, 3) as RgbTuple;

  const contrastRatio =
    contrastMode === 'WCAG2' ? getWCAG2ContrastRatio(rgbA, rgbB) : Math.abs(APCAContrast(rgbA, rgbB));

  // If contrast is sufficient, no border is needed
  if (contrastRatio >= contrastThreshold) {
    return {
      needsBorder: false,
      contrastRatio,
      borderColor: undefined,
      shade: undefined,
      color1Contrast: undefined,
      color2Contrast: undefined,
    };
  }

  // Get the optimal border color (high contrast against both colors)
  const color1Result = highContrastColor(rgbA, contrastMode, borderOptions);
  const color2Result = highContrastColor(rgbB, contrastMode, borderOptions);

  const selectedShade =
    color1Result.shade === color2Result.shade
      ? color1Result.shade // If both prefer the same shade, use it
      : color1Result.ratio > color2Result.ratio // Otherwise use the one with better overall contrast
        ? color1Result.shade
        : color2Result.shade;

  // Use the color that works best with both backgrounds
  // This prefers borders that have sufficient contrast with both colors
  const borderColor =
    color1Result.shade === color2Result.shade
      ? color1Result.color.keyword // If both prefer the same shade, use it
      : color1Result.ratio > color2Result.ratio // Otherwise use the one with better overall contrast
        ? color1Result.color.keyword
        : color2Result.color.keyword;

  return {
    needsBorder: true,
    contrastRatio,
    borderColor,
    shade: selectedShade,
    color1Contrast: color1Result.ratio,
    color2Contrast: color2Result.ratio,
  };
}
