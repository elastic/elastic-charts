/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { APCAcontrast } from './apca_color_contrast';
import { RgbaTuple, RGBATupleToString, RgbTuple } from './color_library_wrappers';

/** @internal */
export function hueInterpolator(colors: RgbTuple[]) {
  return (d: number) => RGBATupleToString(colors[Math.round(d * 255)]);
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
    return [0, 0, 0, 0];
  }

  const r = Math.round((fgR * fgA + bgR * bgA * (1 - fgA)) / alpha);
  const g = Math.round((fgG * fgA + bgG * bgA * (1 - fgA)) / alpha);
  const b = Math.round((fgB * fgA + bgB * bgA * (1 - fgA)) / alpha);
  return [r, g, b, alpha];
}

const COLOR_WHITE: RgbaTuple = [255, 255, 255, 1];
const COLOR_BLACK: RgbaTuple = [0, 0, 0, 1];
/**
 * Use white or black text depending on APCA computed contrast.
 * @internal
 */
export function highContrastColor(background: RgbTuple): RgbaTuple {
  const wWhiteText = APCAcontrast(background, COLOR_WHITE);
  // APCA 60 — Similar to WCAG 4.5∶1
  // APCA will show negative values for light text on a dark background
  return Math.abs(wWhiteText) > 60 ? COLOR_WHITE : COLOR_BLACK;
}
