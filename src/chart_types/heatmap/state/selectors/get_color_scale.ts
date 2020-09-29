/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
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
import createCachedSelector from 're-reselect';

import { ScaleType } from '../../../../scales/constants';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

export type ScaleModelType<Type, Config> = {
  type: Type;
  config: Config;
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
export const getColorScale = createCachedSelector(
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
    } else if (colorScale.type === ScaleType.Quantile) {
      colorScale.config = scaleQuantile<string>()
        .domain(ranges)
        .range(colorRange);
    } else if (colorScale.type === ScaleType.Threshold) {
      colorScale.config = scaleThreshold<number, string>()
        .domain(ranges)
        .range(colorRange);
    } else {
      colorScale.config = scaleLinear<string>()
        .domain(ranges)
        .interpolate(interpolateHcl)
        .range(colorRange);
    }
    return colorScale;
  },
)(getChartIdSelector);
