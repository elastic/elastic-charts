import { rgb as d3Rgb } from 'd3-color';

type RGB = number;
type A = number;
export type RgbTuple = [RGB, RGB, RGB];
export type RgbObject = { r: RGB; g: RGB; b: RGB; opacity: A };

export function stringToRGB(cssColorSpecifier: string): RgbObject {
  return d3Rgb(cssColorSpecifier) || { r: 255, g: 0, b: 0, opacity: 1 };
}

export function argsToRGB(r: number, g: number, b: number, opacity: number): RgbObject {
  return d3Rgb(r, g, b, opacity) || { r: 255, g: 0, b: 0, opacity: 1 };
}
