/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import chroma from 'chroma-js';

import { RgbaTuple } from './color_library_wrappers';

/**
 * A CSS color keyword or a numerical representation (hex, rgb, rgba, hsl, hsla)
 * @public
 */
export type Color = string; // todo static/runtime type it this for proper color string content; several places in the code, and ultimate use, dictate it not be an empty string

/** @internal */
export type ColorScale<T = Color> = (value: number) => T;

/** @internal */
export type ChromaColorScale = ColorScale<chroma.Color>;

/** @internal */
export interface ColorDefinition {
  keyword: Color;
  rgba: RgbaTuple;
}

/** @internal */
export const Colors: Record<
  'Red' | 'White' | 'Black' | 'Transparent' | 'DarkOpaqueRed' | 'Violet' | 'LightBlue' | 'Yellow' | 'Green',
  ColorDefinition
> = {
  Red: {
    keyword: 'red',
    rgba: [255, 0, 0, 1],
  },
  DarkOpaqueRed: {
    keyword: 'red',
    rgba: [128, 0, 0, 0.5],
  },
  White: {
    keyword: 'white',
    rgba: [255, 255, 255, 1],
  },
  Black: {
    keyword: 'black',
    rgba: [0, 0, 0, 1],
  },
  Transparent: {
    keyword: 'transparent',
    rgba: [0, 0, 0, 0],
  },
  Violet: {
    keyword: 'violet',
    rgba: [238, 130, 238, 0.2],
  },
  LightBlue: {
    keyword: 'lightBlue',
    rgba: [173, 216, 230, 0.2],
  },
  Yellow: {
    keyword: 'yellow',
    rgba: [216, 191, 216, 0.5],
  },
  Green: {
    keyword: 'green',
    rgba: [152, 251, 152, 0.5],
  },
};
