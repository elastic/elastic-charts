/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useMemo } from 'react';

import { Axis, Chart, LegendValue, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { noiseTable, sample } from '../utils/datasets/smooth_noise';
import { upToTwoDecimals } from '../utils/formatters';

const POINTS = 200_000;
const SPIKE_EVERY = 9973; // odd, so the spikes alternate between up and down

type SeriesDatum = [x: number, y: number];

function generateData(): SeriesDatum[] {
  const rng = getRandomNumberGenerator('dense-oscillation');
  const trend = noiseTable(rng, 16);
  let level = 0; // the y the line holds until the next jump
  let nextJump = 0; // the row of the next jump to a random level
  return Array.from({ length: POINTS }, (_, i): SeriesDatum => {
    if (i === nextJump) {
      level = rng(-40, 40, 2);
      nextJump += rng(100, 2000); // at ~170 rows per pixel on a 1200 px plot: part of a pixel to a dozen pixels
    }
    // the sign flips on every row: a narrow band around the level, with rare single-row spikes
    const swing = (i % 2 === 0 ? 1 : -1) * rng(0, 3, 2) * (i % SPIKE_EVERY === 0 ? 10 : 1);
    return [i, sample(trend, i / 25_000) * 30 + level + swing];
  });
}

export const Example: ChartsStory = (_, { title, description }) => {
  const data = useMemo(generateData, []);
  const baseTheme = useBaseTheme();
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendPosition={Position.Right}
        // average, median and count aren't in the summary, so the legend rebuilds every row
        legendValues={[
          LegendValue.Min,
          LegendValue.Max,
          LegendValue.Average,
          LegendValue.Median,
          LegendValue.Count,
          LegendValue.CurrentAndLastValue,
        ]}
        baseTheme={baseTheme}
      />
      <Axis id="x" position={Position.Bottom} />
      <Axis id="y" position={Position.Left} tickFormat={upToTwoDecimals} />
      <LineSeries
        id="oscillation"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
        color="black"
        lineSeriesStyle={{ line: { strokeWidth: 0.25 } }}
      />
    </Chart>
  );
};
