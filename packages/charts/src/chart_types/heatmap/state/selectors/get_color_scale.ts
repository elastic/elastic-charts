/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

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
import { HeatmapSpec } from '../../specs/heatmap';
import { HeatmapTable } from './compute_chart_dimensions';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

type ScaleModelType<S> = {
  scale: S;
  ticks: number[];
};

type ScaleLinearType = ScaleModelType<ScaleLinear<string, string>>;
type ScaleQuantizeType = ScaleModelType<ScaleQuantize<string>>;
type ScaleQuantileType = ScaleModelType<ScaleQuantile<string>>;
type ScaleThresholdType = ScaleModelType<ScaleThreshold<number, string>>;

/** @internal */
export type ColorScaleType = ScaleLinearType | ScaleQuantizeType | ScaleQuantileType | ScaleThresholdType;

const DEFAULT_COLORS = ['green', 'red'];

const SCALE_TYPE_TO_SCALE_FN = {
  [ScaleType.Linear]: getLinearScale,
  [ScaleType.Quantile]: getQuantileScale,
  [ScaleType.Quantize]: getQuantizedScale,
  [ScaleType.Threshold]: getThresholdScale,
};

/**
 * @internal
 * Gets color scale based on specification and values range.
 */
export const getColorScale = createCustomCachedSelector(
  [getHeatmapSpecSelector, getHeatmapTableSelector],
  (spec, heatmapTable) => {
    const { scale, ticks } = SCALE_TYPE_TO_SCALE_FN[spec.colorScale ?? ScaleType.Linear](spec, heatmapTable);
    return {
      scale,
      ...dedupTicks(ticks, spec),
    };
  },
);

function dedupTicks(ticks: number[], spec: HeatmapSpec) {
  return ticks.reduce<{ uniqueTicks: string[]; ticks: Array<{ tick: number; formattedTick: string }> }>(
    (acc, curr) => {
      const formattedTick = `${spec.valueFormatter ? spec.valueFormatter(curr) : curr}`;
      if (acc.uniqueTicks.includes(formattedTick)) {
        return acc;
      }
      return {
        uniqueTicks: [...acc.uniqueTicks, formattedTick],
        ticks: [...acc.ticks, { tick: curr, formattedTick }],
      };
    },
    { uniqueTicks: [], ticks: [] },
  );
}

function getQuantizedScale(spec: HeatmapSpec, heatmapTable: HeatmapTable): ScaleQuantizeType {
  const dataExtent = spec.ranges ?? heatmapTable.extent;
  const colors = spec.colors ?? DEFAULT_COLORS;
  // we use the data extent or only the first two values in the `ranges` prop
  const domain: [number, number] = [dataExtent[0], dataExtent[1]];
  const scale = scaleQuantize<string>().domain(domain).range(colors);
  // quantize scale works as the linear one, we should manually
  // compute the ticks corresponding to the quantized segments
  const numOfSegments = colors.length;
  const interval = (domain[1] - domain[0]) / numOfSegments;
  const ticks = colors.map((d, i) => domain[0] + interval * i);

  return {
    scale,
    ticks,
  };
}

function getQuantileScale(spec: HeatmapSpec, heatmapTable: HeatmapTable): ScaleQuantileType {
  const colors = spec.colors ?? DEFAULT_COLORS;
  const domain = heatmapTable.table.map(({ value }) => value);
  const scale = scaleQuantile<string>().domain(domain).range(colors);
  // the ticks array should contain all quantiles + the minimum value
  const ticks = [...new Set([heatmapTable.extent[0], ...scale.quantiles()])];
  return {
    scale,
    ticks,
  };
}

function getThresholdScale(spec: HeatmapSpec, heatmapTable: HeatmapTable): ScaleThresholdType {
  const colors = spec.colors ?? DEFAULT_COLORS;
  const scale = scaleThreshold<number, string>()
    .domain(spec.ranges ?? heatmapTable.extent)
    .range(colors);
  // the ticks array should contain all the thresholds + the minimum value
  const ticks = [...new Set([heatmapTable.extent[0], ...scale.domain()])];
  return {
    scale,
    ticks,
  };
}

function getLinearScale(spec: HeatmapSpec, heatmapTable: HeatmapTable): ScaleLinearType {
  const domain = spec.ranges ?? heatmapTable.extent;
  const colors = spec.colors ?? DEFAULT_COLORS;
  const scale = scaleLinear<string>().domain(domain).interpolate(interpolateHcl).range(colors).clamp(true);
  // adding initial and final range/extent value if they are rounded values.
  const ticks = [...new Set([domain[0], ...scale.ticks(6)])];
  return {
    scale,
    ticks,
  };
}
