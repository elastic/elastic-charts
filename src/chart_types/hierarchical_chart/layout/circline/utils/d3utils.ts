// @ts-ignore
import { arc as d3Arc } from 'd3-shape';
// @ts-ignore
import { scaleOrdinal as d3ScaleOrdinal } from 'd3-scale';
// @ts-ignore
import { quantize as d3Quantize } from 'd3-interpolate';
// @ts-ignore
import { color as d3Color, rgb as d3Rgb } from 'd3-color';
import { Radian, Radius } from '../types/GeometryTypes';
import { ColorScale, SVGPathString } from '../types/Types';
import { SectorTreeNode } from '../types/ViewModelTypes';

export type PathMaker = (d: SectorTreeNode, index: number) => SVGPathString;
type RGB = number;
type A = number;
export type RgbTuple = [RGB, RGB, RGB];
export type RgbObject = { r: RGB; g: RGB; b: RGB; opacity: A };

const ringSectorClockStartAngle = (d: SectorTreeNode): Radian => d.x0;
const ringSectorClockEndAngle = (d: SectorTreeNode): Radian => d.x1;
export const ringSectorInnerRadius = (d: SectorTreeNode): Radius => d.y0px;
export const ringSectorOuterRadius = (d: SectorTreeNode): Radius => d.y1px;
export const ringSectorMiddleRadius = (d: SectorTreeNode): Radius => d.yMidPx;
export const toRGB: (value: any) => RgbObject = d3Color;
export const fromRGB = d3Rgb;

export const arcMaker: PathMaker = d3Arc()
  // @ts-ignore - looks like D3 related types don't know about functions in startAngle etc.; would raise an issue here
  .startAngle(ringSectorClockStartAngle)
  .endAngle(ringSectorClockEndAngle)
  .innerRadius(ringSectorInnerRadius)
  .outerRadius(ringSectorOuterRadius);

export const makeColorScale = (colorMaker: Function, count: number): ColorScale =>
  d3ScaleOrdinal(d3Quantize(colorMaker, count));

export const keyValuesToNameChildren = (d: any) =>
  d.key && d.values ? { name: d.key, children: d.values.map(keyValuesToNameChildren) } : d;
