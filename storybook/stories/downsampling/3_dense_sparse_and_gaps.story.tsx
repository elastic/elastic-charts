/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useMemo } from 'react';

import { Axis, Chart, CurveType, LegendValue, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { noiseTable, sample } from '../utils/datasets/smooth_noise';
import { upToTwoDecimals } from '../utils/formatters';

type SeriesDatum = [x: number, y: number | null];

function generateData(): SeriesDatum[] {
  const rng = getRandomNumberGenerator('dense-sparse-and-gaps');
  const trend = noiseTable(rng, 32);
  let level = 0; // the y the line holds until the next jump
  let nextJump = 0; // the x of the next jump to a random level
  // called in x order; the sign flips on every row, so dense stretches draw a narrow band around the level
  const value = (x: number, k: number) => {
    if (x >= nextJump) {
      level = rng(-8, 8, 2);
      nextJump = x + rng(0.2, 4, 2); // at about a pixel per x unit: part of a pixel to a few pixels
    }
    return 10 + sample(trend, x / 40) * 10 + level + (k % 2 === 0 ? 1 : -1) * rng(0, 1.5, 2);
  };
  const data: SeriesDatum[] = [];
  // appends `count` rows from x `from`, `step` apart
  const append = (from: number, count: number, step: number, y: (x: number, k: number) => number | null) => {
    for (let k = 0; k < count; k++) data.push([from + k * step, y(from + k * step, k)]);
  };
  append(0, 80_000, 0.0025, value); // super dense: hundreds of rows per pixel
  append(200, 8, 25, value); // super sparse: tens of pixels apart
  append(400, 5000, 0.01, () => null); // a long gap
  append(450, 20, 5, (x, k) => (k % 2 === 0 ? value(x, k) : null)); // isolated points between missing ys
  // dense, with gaps of 5, 15, 25 and 35 x units ending at x 650, 750, 850 and 950, and a single missing y
  const isGap = (k: number) => k % 20_000 >= 20_000 - 1000 * (1 + 2 * Math.floor(k / 20_000)) || k === 33_333;
  append(550, 90_000, 0.005, (x, k) => (isGap(k) ? null : value(x, k)));
  return data;
}

// a sparse, continuous series of independent values, whose overshooting curve and dash M4 can't reduce
function generateCurveData(): SeriesDatum[] {
  const rng = getRandomNumberGenerator('dense-sparse-and-gaps-curve');
  return Array.from({ length: 21 }, (_, k): SeriesDatum => [k * 50, rng(5, 20, 2)]);
}

export const Example: ChartsStory = (_, { title, description }) => {
  const data = useMemo(generateData, []);
  const curveData = useMemo(generateCurveData, []);
  const baseTheme = useBaseTheme();
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendPosition={Position.Right}
        // exact from the summary of the downsampled black series; the magenta one isn't downsampled
        legendValues={[
          LegendValue.FirstNonNullValue,
          LegendValue.LastNonNullValue,
          LegendValue.Min,
          LegendValue.Max,
          LegendValue.Difference,
          LegendValue.CurrentAndLastValue,
        ]}
        baseTheme={baseTheme}
      />
      <Axis id="x" position={Position.Bottom} />
      <Axis id="y" position={Position.Left} tickFormat={upToTwoDecimals} />
      <LineSeries
        id="dense, sparse and gaps"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
        color="black"
        curve={CurveType.CURVE_MONOTONE_X}
        lineSeriesStyle={{ line: { strokeWidth: 0.25 } }}
      />
      <LineSeries
        id="sparse curve"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={curveData}
        color="magenta"
        curve={CurveType.CURVE_NATURAL}
        lineSeriesStyle={{ line: { dash: [4, 4] }, point: { visible: 'always' } }}
      />
    </Chart>
  );
};
