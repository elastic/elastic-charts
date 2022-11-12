/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleLinear } from 'd3-scale';

import { getExtent } from '../src/utils';

/** @internal */
export const unitScale = (size: number, padding: number) => scaleLinear().range([size - padding, padding]);
/** @internal */
export const unitScaleInOrder = (size: number, padding: number) => scaleLinear().range([padding, size - padding]);
/** @internal */
export const domainToUnitScale = (values: number[]) => scaleLinear().domain(getExtent(values));
/** @internal */
export const domainScale = (size: number, padding: number, values: number[]) => {
  return scaleLinear()
    .domain(getExtent(values))
    .range([size - padding, padding]);
};

/** @internal */
export const unitToColorScale = (colorPalette: [number, [number, number, number]][]) => {
  const colorStops = colorPalette.map((d) => d[0]);
  const colorTuples = colorPalette.map((d) => d[1]);
  const piecewiseLinearUnitScales = [0, 1, 2].map((index) =>
    scaleLinear()
      .clamp(true)
      .domain(colorStops)
      .range(colorTuples.map((v) => v[index])),
  );

  return (d: number): [number, number, number] => [
    piecewiseLinearUnitScales[0](d),
    piecewiseLinearUnitScales[1](d),
    piecewiseLinearUnitScales[2](d),
  ];
};
