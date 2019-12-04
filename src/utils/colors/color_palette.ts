import * as d3ScaleChromatic from 'd3-scale-chromatic';
import { rgb as d3Rgb, lab as d3Lab, RGBColor } from 'd3-color';
import { interpolateLab } from 'd3-interpolate';
import { scaleLinear, scaleSequential } from 'd3-scale';

export type SequentialColorPaletteName =
  | 'blues'
  | 'greens'
  | 'greys'
  | 'oranges'
  | 'purples'
  | 'reds'
  | 'turbo'
  | 'viridis'
  | 'inferno'
  | 'magma'
  | 'plasma'
  | 'cividis'
  | 'warm'
  | 'cool'
  | 'cubehelixDefault'
  | 'BuGn'
  | 'BuPu'
  | 'GnBu'
  | 'OrRd'
  | 'PuBuGn'
  | 'PuBu'
  | 'PuRd'
  | 'RdPu'
  | 'YlGnBu'
  | 'YlGn'
  | 'YlOrBr'
  | 'YlOrRd';

export type CategoricalSchemeName =
  | 'category10'
  | 'accent'
  | 'dark2'
  | 'paired'
  | 'pastel1'
  | 'pastel2'
  | 'set1'
  | 'set2'
  | 'set3'
  | 'euiPaletteColorBlind'
  | 'euiPaletteForLightBackground'
  | 'euiPaletteForDarkBackground'
  | 'euiPaletteForStatus';

export type CyclicalPaletteName = 'rainbow' | 'sinebow';

export type DivergingInterpolatorName =
  | 'BrBG'
  | 'PRGn'
  | 'PiYG'
  | 'PuOr'
  | 'RdBu'
  | 'RdGy'
  | 'RdYlBu'
  | 'RdYlGn'
  | 'spectral';

type d3ScaleChromaticProp = keyof typeof d3ScaleChromatic;

function transformSchemeName(schemeName: CategoricalSchemeName): string {
  const schemeNameCapitalized = schemeName.charAt(0).toUpperCase() + schemeName.slice(1);
  return `scheme${schemeNameCapitalized}`;
}

function transformPaletteName(
  colorPaletteName: SequentialColorPaletteName | CyclicalPaletteName | DivergingInterpolatorName,
): string {
  const colorPaletteNameCapitalized = colorPaletteName.charAt(0).toUpperCase() + colorPaletteName.slice(1);
  return `interpolate${colorPaletteNameCapitalized}`;
}

function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName]; // o[propertyName] is of type T[K]
}

function isValidColorPaletteName(name: string): boolean {
  let result = false;
  Object.keys(d3ScaleChromatic).forEach((key) => {
    if (key === name) {
      result = true;
      return;
    }
  });
  return result;
}

function getInterpolatorOrThrow(
  name: SequentialColorPaletteName | CyclicalPaletteName | DivergingInterpolatorName,
): (t: number) => string {
  const paletteName = transformPaletteName(name) as d3ScaleChromaticProp;
  if (!isValidColorPaletteName(paletteName)) {
    throw new Error('Invalid palette name provided');
  }
  return getProperty(d3ScaleChromatic, paletteName) as ((t: number) => string);
}

export function getCategoricalPalette(name: CategoricalSchemeName): ReadonlyArray<string> {
  const schemeName: d3ScaleChromaticProp = transformSchemeName(name) as d3ScaleChromaticProp;
  if (isValidColorPaletteName(schemeName)) {
    return getProperty(d3ScaleChromatic, schemeName) as ReadonlyArray<string>;
  }
  return d3ScaleChromatic.schemeCategory10;
}

export function getSequentialPalette(name: SequentialColorPaletteName, steps: number): ReadonlyArray<string> {
  const interpolator = getInterpolatorOrThrow(name);
  const paletteColors = [];
  const scale = scaleSequential(interpolator).domain([1, steps]);
  for (let i = 1; i <= steps; i++) {
    paletteColors.push(d3Rgb(scale(i)).hex());
  }
  return paletteColors;
}

export function getCustomSequentialPalette(colors: string[], steps: number): ReadonlyArray<string> {
  const startingColor = d3Lab(colors[0]).brighter();
  const endingColor = d3Lab(colors[1]).darker();
  const paletteColors = [];
  const scale = scaleLinear<RGBColor, RGBColor>()
    .domain([1, steps])
    .interpolate(interpolateLab)
    .range([d3Rgb(startingColor), d3Rgb(endingColor)]);
  for (let i = 1; i <= steps; i++) {
    paletteColors.push(d3Rgb(scale(i)).hex());
  }
  return paletteColors;
}

export function getCyclicalPalette(name: CyclicalPaletteName, steps: number): ReadonlyArray<string> {
  if (steps <= 0) {
    throw new Error('Number of steps should be a positive integer');
  }
  const interpolator = getInterpolatorOrThrow(name);
  const paletteColors = [];
  for (let i = 0; i < steps; i++) {
    paletteColors.push(d3Rgb(interpolator(i / steps)).hex());
  }
  return paletteColors;
}

export function getDivergingPalette(
  steps: number,
  interpolatorName: DivergingInterpolatorName = 'spectral',
): ReadonlyArray<string> {
  const interpolator = getInterpolatorOrThrow(interpolatorName);
  const scale = scaleSequential(interpolator).domain([1, steps]);
  const paletteColors = [];
  for (let i = 1; i <= steps; i++) {
    paletteColors.push(d3Rgb(scale(i)).hex());
  }
  return paletteColors;
}
