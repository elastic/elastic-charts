import { rgb as d3Rgb } from 'd3-color';

type RGB = number;
type A = number;
export type RgbTuple = [RGB, RGB, RGB];
export type RgbObject = { r: RGB; g: RGB; b: RGB; opacity: A };

export type ColorScale = (value: any) => RgbObject | null;
export const toRGB: ColorScale = d3Rgb;
export const fromRGB = d3Rgb;

export function keyValuesToNameChildren(d: any) {
  return d.key && d.values ? { name: d.key, children: d.values.map(keyValuesToNameChildren) } : d;
}
