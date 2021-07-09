/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { extent as d3Extent } from 'd3-array';
import { interpolateHcl } from 'd3-interpolate';
import {
  ScaleLinear,
  scaleLinear,
  ScaleQuantile,
  scaleQuantile,
  ScaleQuantize,
  scaleQuantize,
  ScaleThreshold,
  scaleThreshold,
} from 'd3-scale';

import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

type ScaleModelType<Type, Config> = {
  type: Type;
  config: Config;
  ticks: number[];
};
type ScaleLinearType = ScaleModelType<typeof ScaleType.Linear, ScaleLinear<string, string>>;
type ScaleQuantizeType = ScaleModelType<typeof ScaleType.Quantize, ScaleQuantize<string>>;
type ScaleQuantileType = ScaleModelType<typeof ScaleType.Quantile, ScaleQuantile<string>>;
type ScaleThresholdType = ScaleModelType<typeof ScaleType.Threshold, ScaleThreshold<number, string>>;
/** @internal */
export type ColorScaleType = ScaleLinearType | ScaleQuantizeType | ScaleQuantileType | ScaleThresholdType;

/**
 * @internal
 * Gets color scale based on specification and values range.
 */
export const getColorScale = createCustomCachedSelector(
  [getHeatmapSpecSelector, getHeatmapTableSelector],
  (spec, heatmapTable) => {
    const { colors, colorScale: colorScaleSpec } = spec;

    // compute the color scale based domain and colors
    const { ranges = heatmapTable.extent } = spec;
    const colorRange = colors ?? ['green', 'red'];

    const colorScale = {
      type: colorScaleSpec,
    } as ColorScaleType;
    if (colorScale.type === ScaleType.Quantize) {
      colorScale.config = scaleQuantize<string>()
        .domain(d3Extent(ranges) as [number, number])
        .range(colorRange);
      colorScale.ticks = colorScale.config.ticks(spec.colors.length);
    } else if (colorScale.type === ScaleType.Quantile) {
      colorScale.config = scaleQuantile<string>().domain(ranges).range(colorRange);
      colorScale.ticks = colorScale.config.quantiles();
    } else if (colorScale.type === ScaleType.Threshold) {
      colorScale.config = scaleThreshold<number, string>().domain(ranges).range(colorRange);
      colorScale.ticks = colorScale.config.domain();
    } else {
      colorScale.config = scaleLinear<string>().domain(ranges).interpolate(interpolateHcl).range(colorRange);
      colorScale.ticks = addBaselineOnLinearScale(ranges[0], ranges[1], colorScale.config.ticks(6));
    }
    return colorScale;
  },
);

function addBaselineOnLinearScale(min: number, max: number, ticks: Array<number>): Array<number> {
  if (min < 0 && max < 0) {
    return [...ticks, 0];
  }
  if (min >= 0 && max >= 0) {
    return [0, ...ticks];
  }

  return ticks;
}
