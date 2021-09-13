/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';
import { rgb as d3Rgb, RGBColor as D3RGBColor } from 'd3-color';

import { clamp, Color } from '../utils/common';

type RGB = number;
type A = number;

/** @internal */
export type RgbTuple = [RGB, RGB, RGB, RGB?];
/** @public */
export type RgbObject = { r: RGB; g: RGB; b: RGB; opacity: A };

/** @internal */
export type RgbaTuple = [RGB, RGB, RGB, RGB];

/** @internal */
export const defaultColor: RgbObject = { r: 255, g: 0, b: 0, opacity: 1 };
/** @internal */
export const transparentColor: RgbObject = { r: 0, g: 0, b: 0, opacity: 0 };
/** @internal */
export const defaultD3Color: D3RGBColor = d3Rgb(defaultColor.r, defaultColor.g, defaultColor.b, defaultColor.opacity);

/** @internal */
export type OpacityFn = (opacity: number, seriesOpacity?: number) => number;

/** @internal */
export function overrideOpacity([r, g, b, o]: RgbaTuple, opacity?: number | OpacityFn): RgbaTuple {
  const opacityOverride = opacity === undefined ? o : typeof opacity === 'number' ? opacity : opacity(o);

  // don't apply override on transparent color to avoid unwanted behaviours
  // todo check if we can apply to every transparent colors
  if (r === 0 && b === 0 && g === 0 && o === 0) {
    return [0, 0, 0, 0];
  }
  return [r, g, b, clamp(Number.isFinite(opacityOverride) ? opacityOverride : o, 0, 1)];
}

/** @internal */
export function RGBATupleToString(rgba: RgbTuple): Color {
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] ?? 1})`;
}

/** @internal */
export function isValid(color: Color): chroma.Color | false {
  try {
    // ref https://github.com/gka/chroma.js/issues/280
    return chroma(color === 'transparent' ? 'rgba(0,0,0,0)' : color);
  } catch {
    return false;
  }
}
