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

const SERIES_COUNT = 5;
const POINTS_PER_SERIES = 50_000;

type SeriesDatum = [x: number, y: number];

function generateData(): SeriesDatum[][] {
  const rng = getRandomNumberGenerator('dense-rotated-lines');
  return Array.from({ length: SERIES_COUNT }, (_, seriesIndex) => {
    const trend = noiseTable(rng, 24);
    const ripple = noiseTable(rng, 96);
    return Array.from({ length: POINTS_PER_SERIES }, (__, i): SeriesDatum => {
      const noise = sample(trend, i / 2000) * 8 + sample(ripple, i / 40) * 3 + rng(0, 2, 3);
      return [i, seriesIndex * 10 + noise];
    });
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
        // all exact from the summary of a downsampled series
        legendValues={[
          LegendValue.FirstValue,
          LegendValue.LastValue,
          LegendValue.Min,
          LegendValue.Max,
          LegendValue.Range,
          LegendValue.CurrentAndLastValue,
        ]}
        rotation={90}
        baseTheme={baseTheme}
      />
      <Axis id="x" position={Position.Left} />
      <Axis id="y" position={Position.Bottom} tickFormat={upToTwoDecimals} />
      {data.map((seriesData, index) => (
        <LineSeries
          key={index}
          id={`series-${index + 1}`}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={seriesData}
        />
      ))}
    </Chart>
  );
};
