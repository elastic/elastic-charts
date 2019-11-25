import * as d3ScaleChromatic from 'd3-scale-chromatic';
import { rgb as d3Rgb, lab as d3Lab, RGBColor } from 'd3-color';
import { interpolateHcl, quantize, interpolateLab } from 'd3-interpolate';
import { scaleSequential, scaleLinear } from 'd3-scale';

export type ColorPaletteName =
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
  | 'YlOrBr'
  | 'YlOrRd[';
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

function transformSchemeName(schemeName: CategoricalSchemeName): string {
  const schemeNameCapitalized = schemeName.charAt(0).toUpperCase() + schemeName.slice(1);
  return `scheme${schemeNameCapitalized}`;
}

function transformPaletteName(colorPaletteName: ColorPaletteName): string {
  const colorPaletteNameCapitalized = colorPaletteName.charAt(0).toUpperCase() + colorPaletteName.slice(1);
  return `interpolate${colorPaletteNameCapitalized}`;
}

function euiColorPalette(name: CategoricalSchemeName): string[] {
  switch (name) {
    case 'euiPaletteColorBlind':
      return [
        '#1ea593',
        '#2b70f7',
        '#ce0060',
        '#38007e',
        '#fca5d3',
        '#f37020',
        '#e49e29',
        '#b0916F',
        '#7b000b',
        '#34130c',
      ];
    case 'euiPaletteForLightBackground':
      return ['#006bb4', '#017d73', '#f5a700', '#bd271e', '#dd0a73'];
    case 'euiPaletteForDarkBackground':
      return ['#1ba9F5', '#7de2d1', '#f990c0', '#f66', '#fFce7a'];
    case 'euiPaletteForStatus':
      return [
        '#58ba6d',
        '#6ece67',
        '#a5e26a',
        '#d2e26a',
        '#ebdF61',
        '#ebd361',
        '#ebc461',
        '#d99d4c',
        '#d97e4c',
        '#d75949',
      ];
    default:
      throw new Error('Unsupported EUI palette name');
  }
}

export function getCategoricalPalette(name: CategoricalSchemeName): ReadonlyArray<string> {
  if (name.startsWith('eui')) {
    return euiColorPalette(name);
  }
  const schemeName: string = transformSchemeName(name);
  // @ts-ignore
  return d3ScaleChromatic[schemeName];
}

export function getCustomCategoricalPalette(colors: string[], steps: number) {
  const paletteColors = [];
  const scale = quantize(interpolateHcl(colors[0], colors[1]), steps);
  for (let i = 0; i < steps; i++) {
    paletteColors.push(d3Rgb(scale[i]).hex());
  }
  return paletteColors;
}

export function getSequentialPalette(name: ColorPaletteName, steps: number) {
  const paletteName = transformPaletteName(name);
  const paletteColors = [];
  // @ts-ignore
  const scale = scaleSequential(d3ScaleChromatic[paletteName]).domain([1, steps]);
  for (let i = 1; i <= steps; i++) {
    // @ts-ignore
    paletteColors.push(d3Rgb(scale(i)).hex());
  }
  return paletteColors;
}

export function getCustomSequentialPalette(colors: string[], steps: number) {
  const startingColor = d3Lab(colors[0]).brighter();
  const endingColor = d3Lab(colors[1]).darker();
  const paletteColors = [];
  const scale = scaleLinear<RGBColor, RGBColor>()
    .domain([1, steps])
    .interpolate(interpolateLab)
    .range([d3Rgb(startingColor), d3Rgb(endingColor)]);
  for (let i = 1; i <= steps; i++) {
    // @ts-ignore
    paletteColors.push(d3Rgb(scale(i)).hex());
  }
  return paletteColors;
}

export function getCyclicalPalette(steps: number) {
  if (steps <= 0) {
    throw new Error('Number of steps should be a positive integer');
  }
  const paletteColors = [];
  for (let i = 0; i < steps; i++) {
    paletteColors.push(d3Rgb(d3ScaleChromatic.interpolateRainbow(i / steps)).hex());
  }
  return paletteColors;
}

export function getDivergingPalette(steps: number) {
  const scale = scaleSequential(d3ScaleChromatic.interpolateRdYlGn).domain([1, steps]);
  const paletteColors = [];
  for (let i = 1; i <= steps; i++) {
    paletteColors.push(d3Rgb(scale(i)).hex());
  }
  return paletteColors;
}
