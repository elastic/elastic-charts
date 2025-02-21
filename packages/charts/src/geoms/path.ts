/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { line, area } from 'd3-shape';

import type { CurveType } from '../utils/curves';
import { getCurveFactory } from '../utils/curves';

type SVGPath = string;

type LineGenerator<D> = (data: D[]) => SVGPath;

/** @internal */
export function lineGenerator<D>(
  xProject: (x: D) => number,
  yProject: (y: D) => number,
  defined: (d: D) => boolean,
  curve: CurveType,
): LineGenerator<D> {
  const generator = line<D>().x(xProject).y(yProject).defined(defined).curve(getCurveFactory(curve));
  return (d) => generator(d) ?? '';
}

type AreaGenerator<D> = {
  y0: (data: D[]) => SVGPath;
  y1: (data: D[]) => SVGPath;
  area: (data: D[]) => SVGPath;
};

/** @internal */
export function areaGenerator<D>(
  xProject: (x: D) => number,
  y0Project: (y: D) => number,
  y1Project: (y: D) => number,
  defined: (d: D) => boolean,
  curve: CurveType,
): AreaGenerator<D> {
  const generator = area<D>().x(xProject).y0(y0Project).y1(y1Project).defined(defined).curve(getCurveFactory(curve));
  return {
    y0: (d) => generator.lineY0()(d) ?? '',
    y1: (d) => generator.lineY1()(d) ?? '',
    area: (d) => generator(d) ?? '',
  };
}
