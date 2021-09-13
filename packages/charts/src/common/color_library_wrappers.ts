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
export function stringToRGB(cssColorSpecifier?: string, opacity?: number | OpacityFn): RgbObject {
  if (cssColorSpecifier === 'transparent') {
    return transparentColor;
  }
  const color = getColor(cssColorSpecifier);

  if (opacity === undefined) {
    return color;
  }

  const opacityOverride = typeof opacity === 'number' ? opacity : opacity(color.opacity);

  if (isNaN(opacityOverride)) {
    return color;
  }

  return {
    ...color,
    opacity: opacityOverride,
  };
}

function overrideOpacity([r, g, b, o]: RgbaTuple, opacity?: number | OpacityFn) {
  const opacityOverride = opacity === undefined ? o : typeof opacity === 'number' ? opacity : opacity(o);
  return [r, g, b, clamp(Number.isFinite(opacityOverride) ? opacityOverride : o, 0, 1)];
}

/**
 * Returns color as RgbObject or default fallback.
 *
 * Handles issue in d3-color for hsla and rgba colors with alpha value of `0`
 *
 * @param cssColorSpecifier
 */
function getColor(cssColorSpecifier: string = ''): RgbObject {
  if (!chroma.valid(cssColorSpecifier)) return defaultColor;

  const chromaColor = chroma(cssColorSpecifier);
  const color: D3RGBColor = {
    ...d3Rgb(chromaColor.alpha(1).css()),
    opacity: chromaColor.alpha(),
  };

  return validateColor(color) ?? defaultColor;
}

/** @internal */
export function validateColor(color: D3RGBColor): D3RGBColor | null {
  const { r, g, b, opacity } = color;

  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(opacity)) {
    return null;
  }

  return color;
}

/** @internal */
export function argsToRGB(r: number, g: number, b: number, opacity: number): D3RGBColor {
  return validateColor(d3Rgb(r, g, b, opacity)) ?? defaultD3Color;
}

/** @internal */
export function argsToRGBString(r: number, g: number, b: number, opacity: number): string {
  // d3.rgb returns an Rgb instance, which has a specialized `toString` method
  return argsToRGB(r, g, b, opacity).toString();
}

/** @internal */
export function RGBtoString(rgb: RgbObject): string {
  const { r, g, b, opacity } = rgb;
  return argsToRGBString(r, g, b, opacity);
}

/** @internal */
export function RGBATupleToString(rgba: RgbTuple): string {
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] ?? 1})`;
}

/** convert rgb to hex
 * @internal */
export function RGBAToHex(rgba: Color) {
  return chroma(rgba).hex();
}

/** convert hex to rgb
 * @internal */
export function HexToRGB(hex: string) {
  return chroma(hex).rgba();
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
