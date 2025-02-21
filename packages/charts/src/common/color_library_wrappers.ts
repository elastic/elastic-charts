/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';

import type { Color } from './colors';
import { Colors } from './colors';
import { LRUCache } from './data_structures';
import { clamp } from '../utils/common';
import { Logger } from '../utils/logger';

/** @public */
export type RGB = number;

/** @public */
export type A = number;

/** @internal */
export type RgbTuple = [r: RGB, g: RGB, b: RGB, alpha?: A];

/** @public */
export type RgbaTuple = [r: RGB, g: RGB, b: RGB, alpha: A];

/** @internal */
export type OpacityFn = (opacity: number) => number;

/** @internal */
export function overrideOpacity([r, g, b, o]: RgbaTuple, opacity?: number | OpacityFn): RgbaTuple {
  const opacityOverride = opacity === undefined ? o : typeof opacity === 'number' ? opacity : opacity(o);

  // don't apply override on transparent color to avoid unwanted behaviours
  // todo check if we can apply to every transparent colors
  if (r === 0 && b === 0 && g === 0 && o === 0) {
    return Colors.Transparent.rgba;
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
    return chroma(color === Colors.Transparent.keyword ? 'rgba(0,0,0,0)' : color);
  } catch {
    return false;
  }
}

/** @internal */
export function getChromaColor(color: string): chroma.Color;
/** @internal */
export function getChromaColor(color: RgbaTuple): chroma.Color;
/** @internal */
export function getChromaColor(color: string | RgbaTuple): chroma.Color {
  if (typeof color === 'string') return chroma(color.toLowerCase());
  // chroma mutates the input
  return chroma(...color);
}

/** @internal */
export function getGreensColorScale(gamma: number, domain: [number, number]): (value: number) => Color {
  const scale = chroma.scale(chroma.brewer.Greens).gamma(gamma).domain(domain);
  return (value: number) => scale(value).css();
}

const rgbaCache = new LRUCache<Color, RgbaTuple>(200);

/** @internal */
export function colorToRgba(color: Color): RgbaTuple {
  const cachedValue = rgbaCache.get(color);
  if (cachedValue === undefined) {
    const chromaColor = isValid(color);
    if (chromaColor === false) Logger.warn(`The provided color is not a valid CSS color, using RED as fallback`, color);
    const newValue: RgbaTuple = chromaColor ? chromaColor.rgba() : Colors.Red.rgba;
    rgbaCache.set(color, newValue);
    return newValue;
  }
  return cachedValue;
}

/** @internal */
export function colorToHsl(color: Color): [h: number, s: number, l: number, a: number] {
  const [r, g, b, a] = colorToRgba(color);
  const [h, s, l] = chroma.rgb(r, g, b).hsl(); // alpha not preserved
  return [h, s, l, a];
}

/** @internal */
export function hslToColor(h: number, s: number, l: number, a = 1): Color {
  const rgba = chroma.hsl(h, s, l).alpha(a).rgba();
  return RGBATupleToString(rgba);
}

/** @internal */
export function changeColorLightness(color: Color, lightnessAmount: number, lightnessThreshold: number): Color {
  const [h, s, l, a] = colorToHsl(color);
  return hslToColor(h, s, l >= lightnessThreshold ? l - lightnessAmount : l + lightnessAmount, a);
}
