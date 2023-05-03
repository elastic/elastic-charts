/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { APCAContrast } from './apca_color_contrast';
import { RgbaTuple, RGBATupleToString, RgbTuple } from './color_library_wrappers';
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

function getHighContrastColorWCAG2(background: RgbTuple): RgbaTuple {
  const wWhite = getWCAG2ContrastRatio(Colors.White.rgba, background);
  const wBlack = getWCAG2ContrastRatio(Colors.Black.rgba, background);
  return wWhite >= wBlack ? Colors.White.rgba : Colors.Black.rgba;
}

function getHighContrastColorAPCA(background: RgbTuple): RgbaTuple {
  const wWhiteText = Math.abs(APCAContrast(background, Colors.White.rgba));
  const wBlackText = Math.abs(APCAContrast(background, Colors.Black.rgba));
  return wWhiteText > wBlackText ? Colors.White.rgba : Colors.Black.rgba;
}

const HIGH_CONTRAST_FN = {
  WCAG2: getHighContrastColorWCAG2,
  WCAG3: getHighContrastColorAPCA,
};

/**
 * Use white or black text depending on the high contrast mode used
 * @internal
 */
export function highContrastColor(background: RgbTuple, mode: keyof typeof HIGH_CONTRAST_FN = 'WCAG2'): RgbaTuple {
  return HIGH_CONTRAST_FN[mode](background);
}
