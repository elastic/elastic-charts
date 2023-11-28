/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export interface ColorScales {
  [key: string]: string;
}

interface EchPalette {
  colors: string[];
}

const echPaletteColorBlind: EchPalette = {
  colors: [
    '#54B399',
    '#6092C0',
    '#9170B8',
    '#CA8EAE',
    '#D36086',
    '#E7664C',
    '#AA6556',
    '#DA8B45',
    '#B9A888',
    '#D6BF57',
  ],
  // TODO swap colors for original colors after main changes
  // colors: [
  //   '#54B399',
  //   '#6092C0',
  //   '#D36086',
  //   '#9170B8',
  //   '#CA8EAE',
  //   '#D6BF57',
  //   '#B9A888',
  //   '#DA8B45',
  //   '#AA6556',
  //   '#E7664C',
  // ],
};

const echPaletteForLightBackground: EchPalette = {
  colors: ['#006BB4', '#017D73', '#F5A700', '#BD271E', '#DD0A73'],
};

const echPaletteForDarkBackground: EchPalette = {
  colors: ['#1BA9F5', '#7DE2D1', '#F990C0', '#F66', '#FFCE7A'],
};

const echPaletteForStatus: EchPalette = {
  colors: [
    '#209280',
    '#359F8A',
    '#4AAC94',
    '#6EB58C',
    '#A2BA71',
    '#DD9B53',
    '#E4784E',
    '#E2634A',
    '#D75C46',
    '#CC5642',
  ],
};

/** @internal */
export const palettes = {
  echPaletteColorBlind,
  echPaletteForLightBackground,
  echPaletteForDarkBackground,
  echPaletteForStatus,
};
