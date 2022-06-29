/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { degToRad } from '../../../utils/common';
import { PointShape, TextureShape } from '../../../utils/themes/theme';

/** @internal */
export type SVGPath = string;

/** @internal */
export type SVGPathFn = (radius: number) => SVGPath;

const cross: SVGPathFn = (r: number) => {
  return `M ${-r} 0 L ${r} 0 M 0 ${r} L 0 ${-r}`;
};

const triangle: SVGPathFn = (r: number) => {
  const h = (r * Math.sqrt(3)) / 2;
  const hr = r / 2;
  return `M ${-h} ${hr} L ${h} ${hr} L 0 ${-r} Z`;
};

/**
 * Returns shape function based on rotation of square in degrees
 */
const square =
  (rotation = 0): SVGPathFn =>
  (r: number) => {
    const d = degToRad(rotation);
    const s = Math.abs(Math.cos(d) + Math.sin(d));
    // scaled r to account for rotation;
    const sr = s > 0 ? r / s : r;
    return `M ${-sr} ${-sr} L ${-sr} ${sr} L ${sr} ${sr} L ${sr} ${-sr} Z`;
  };

const circle: SVGPathFn = (r: number) => {
  return `M ${-r} 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0`;
};

const line: SVGPathFn = (r: number) => {
  return `M 0 ${-r} l 0 ${r * 2}`;
};

/** @internal */
export const ShapeRendererFn: Record<PointShape, [SVGPathFn, number]> = {
  [PointShape.Circle]: [circle, 0],
  [PointShape.X]: [cross, 45],
  [PointShape.Plus]: [cross, 0],
  [PointShape.Diamond]: [square(45), 45],
  [PointShape.Square]: [square(0), 0],
  [PointShape.Triangle]: [triangle, 0],
};

/** @internal */
export const TextureRendererFn: Record<TextureShape, [SVGPathFn, number]> = {
  ...ShapeRendererFn,
  [TextureShape.Line]: [line, 0],
};
