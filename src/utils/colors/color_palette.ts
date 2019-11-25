import * as d3ScaleChromatic from 'd3-scale-chromatic';
import { rgb as d3Rgb, lab as d3Lab } from 'd3-color';
import { interpolateHcl, interpolateLab, quantize } from 'd3-interpolate';
import { scaleLinear, scaleSequential } from 'd3-scale';

export type ColorPaletteName = 'blues' | 'greens' | 'greys' | 'oranges' | 'purples' | 'reds';
export type CategoricalSchemeName =
  | 'category10'
  | 'accent'
  | 'dark2'
  | 'paired'
  | 'pastel1'
  | 'pastel2'
  | 'set1'
  | 'set2'
  | 'set3';

function transformSchemeName(schemeName: CategoricalSchemeName): string {
  const schemeNameCapitalized = schemeName.charAt(0).toUpperCase() + schemeName.slice(1);
  return `scheme${schemeNameCapitalized}`;
}

function transformPaletteName(colorPaletteName: ColorPaletteName): string {
  const colorPaletteNameCapitalized = colorPaletteName.charAt(0).toUpperCase() + colorPaletteName.slice(1);
  return `interpolate${colorPaletteNameCapitalized}`;
}

export function getCategoricalPalette(name: CategoricalSchemeName): ReadonlyArray<string> {
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
  // @ts-ignore
  const scale = scaleLinear()
    .domain([1, steps])
    // @ts-ignore
    .interpolate(interpolateLab)
    .range([d3Rgb(startingColor), d3Rgb(endingColor)]);
  for (let i = 1; i <= steps; i++) {
    // @ts-ignore
    paletteColors.push(d3Rgb(scale(i)).hex());
  }
  return paletteColors;
}

export function getCyclicalPalette(steps: number) {
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
