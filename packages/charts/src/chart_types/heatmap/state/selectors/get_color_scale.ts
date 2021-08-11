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
import { identity } from '../../../../utils/common';
import { HeatmapSpec } from '../../specs/heatmap';
import { HeatmapTable } from './compute_chart_dimensions';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

type ScaleModelType<S> = {
  scale: S;
  bands: Array<{ start: number }>;
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
const DEFAULT_COLOR_SCALE_TYPE = ScaleType.Linear;

/**
 * @internal
 * Gets color scale based on specification and values range.
 */
export const getColorScale = createCustomCachedSelector(
  [getHeatmapSpecSelector, getHeatmapTableSelector],
  (spec, heatmapTable) => {
    const { scale, bands } = SCALE_TYPE_TO_SCALE_FN[spec.colorScale ?? DEFAULT_COLOR_SCALE_TYPE](spec, heatmapTable);
    return {
      scale,
      bands: dedupBands(bands, spec),
    };
  },
);

function dedupBands(bands: Array<{ start: number }>, spec: HeatmapSpec) {
  const formatter = spec.valueFormatter ?? identity;
  const bandsWithFormattedStarts = bands.reduce<Map<string, { start: number; formattedStart: string }>>(
    (acc, { start }) => {
      const formattedStart = `${formatter(start)}`;
      acc.set(formattedStart, { start, formattedStart });
      return acc;
    },
    new Map(),
  );
  return [...bandsWithFormattedStarts.values()];
}

function getQuantizedScale(spec: HeatmapSpec, heatmapTable: HeatmapTable): ScaleQuantizeType {
  const domain =
    Array.isArray(spec.ranges) && spec.ranges.length > 1 ? (spec.ranges as [number, number]) : heatmapTable.extent;
  const colors = spec.colors?.length > 0 ? spec.colors : DEFAULT_COLORS;
  // we use the data extent or only the first two values in the `ranges` prop
  const scale = scaleQuantize<string>().domain(domain).range(colors);
  // quantize scale works as the linear one, we should manually
  // compute the start of each band corresponding to the quantized segments
  const numOfSegments = colors.length;
  const interval = (domain[1] - domain[0]) / numOfSegments;
  const bands = colors.map((color, i) => ({ start: domain[0] + interval * i }));

  return {
    scale,
    bands,
  };
}

function getQuantileScale(spec: HeatmapSpec, heatmapTable: HeatmapTable): ScaleQuantileType {
  const colors = spec.colors ?? DEFAULT_COLORS;
  const domain = heatmapTable.table.map(({ value }) => value);
  const scale = scaleQuantile<string>().domain(domain).range(colors);
  // the bands array should contain all quantiles + the minimum value
  const bands = [...new Set([heatmapTable.extent[0], ...scale.quantiles()])].map((start) => ({ start }));
  return {
    scale,
    bands,
  };
}

function getThresholdScale(spec: HeatmapSpec, heatmapTable: HeatmapTable): ScaleThresholdType {
  const colors = spec.colors ?? DEFAULT_COLORS;
  const domain = spec.ranges ?? heatmapTable.extent;
  const scale = scaleThreshold<number, string>().domain(domain).range(colors);
  // the start band array should contain all the thresholds + the minimum value
  const bands = [...new Set([heatmapTable.extent[0], ...domain])].map((start) => ({ start }));
  return {
    scale,
    bands,
  };
}

function getLinearScale(spec: HeatmapSpec, heatmapTable: HeatmapTable): ScaleLinearType {
  const domain = spec.ranges ?? heatmapTable.extent;
  const colors = spec.colors ?? DEFAULT_COLORS;
  const scale = scaleLinear<string>().domain(domain).interpolate(interpolateHcl).range(colors).clamp(true);
  // adding initial and final range/extent value if they are rounded values.
  const bands = [...new Set([domain[0], ...scale.ticks(6)])].map((start) => ({ start }));
  return {
    scale,
    bands,
  };
}
