/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useMemo } from 'react';

import { Chart, CurveType, LineSeries, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme, useThemeId } from '../../use_base_theme';
import { noiseTable, sample } from '../utils/datasets/smooth_noise';

type SeriesDatum = [x: number, y: number | null];

// x runs from 0 to 1000: dense stretches have 100 rows per x unit, sparse ones a row every 25 units
const DENSE_STEP = 0.01;
const SPARSE_STEP = 25;

// rows from x `from` up to `to`, `step` apart, called in x order
function rows(from: number, to: number, step: number, y: (x: number) => number | null): SeriesDatum[] {
  return Array.from({ length: Math.round((to - from) / step) }, (_, k) => [from + k * step, y(from + k * step)]);
}

function smooth(): SeriesDatum[] {
  const trend = noiseTable(getRandomNumberGenerator('grid-smooth'), 12);
  const y = (x: number) => sample(trend, x / 80) * 100;
  return [...rows(0, 400, DENSE_STEP, y), ...rows(400, 700, SPARSE_STEP, y), ...rows(700, 1000, DENSE_STEP, y)];
}

function noisy(): SeriesDatum[] {
  const rng = getRandomNumberGenerator('grid-noisy');
  const trend = noiseTable(rng, 12);
  const level = (x: number) => sample(trend, x / 80) * 100;
  const y = (x: number) => level(x) + rng(-20, 20, 2);
  return [...rows(0, 400, DENSE_STEP, y), ...rows(400, 700, SPARSE_STEP, level), ...rows(700, 1000, DENSE_STEP, y)];
}

function brownian(): SeriesDatum[] {
  const rng = getRandomNumberGenerator('grid-brownian');
  let y = 0;
  return rows(0, 1000, DENSE_STEP, () => (y += rng(-1, 1, 3)));
}

function brownianWithSparseMiddle(): SeriesDatum[] {
  const rng = getRandomNumberGenerator('grid-brownian-sparse');
  let y = 0;
  const step = () => (y += rng(-1, 1, 3));
  // the same walk, but only every SPARSE_STEP / DENSE_STEP steps is a row
  const skip = () => {
    for (let k = 1; k < SPARSE_STEP / DENSE_STEP; k++) step();
    return step();
  };
  return [
    ...rows(0, 400, DENSE_STEP, step),
    ...rows(400, 700, SPARSE_STEP, skip),
    ...rows(700, 1000, DENSE_STEP, step),
  ];
}

function wild(): SeriesDatum[] {
  const rng = getRandomNumberGenerator('grid-wild');
  const y = () => rng(0, 100, 2);
  return [
    ...rows(0, 200, DENSE_STEP, y),
    ...rows(200, 400, SPARSE_STEP, y),
    ...rows(400, 600, DENSE_STEP, y),
    ...rows(600, 800, SPARSE_STEP, y),
    ...rows(800, 1000, DENSE_STEP, y),
  ];
}

function gapsAndSpikes(): SeriesDatum[] {
  const rng = getRandomNumberGenerator('grid-gaps-spikes');
  const trend = noiseTable(rng, 12);
  const level = (x: number) => 20 + sample(trend, x / 80) * 60;
  return [
    ...rows(0, 300, DENSE_STEP, (x) => level(x) + (Math.round(x / DENSE_STEP) % 7919 === 0 ? 40 : 0)), // single-row spikes
    ...rows(300, 400, DENSE_STEP, () => null), // a long gap
    ...rows(400, 500, 10, (x) => (Math.round(x / 10) % 2 === 0 ? level(x) : null)), // isolated points
    ...rows(500, 1000, DENSE_STEP, (x) => (Math.floor(x / 50) % 3 === 2 ? null : level(x) + rng(-3, 3, 2))), // gaps
  ];
}

const CASES = [
  ['smooth', smooth],
  ['noisy', noisy],
  ['Brownian', brownian],
  ['Brownian, sparse middle', brownianWithSparseMiddle],
  ['wild, dense and sparse', wild],
  ['gaps and spikes', gapsAndSpikes],
] as const;

const CURVES = [
  ['linear', CurveType.LINEAR],
  ['monotone X', CurveType.CURVE_MONOTONE_X],
  ['step after', CurveType.CURVE_STEP_AFTER],
] as const;

// the six rows, 940 px with the gaps, fit the 1000 px tall VRT window with the story's 20 px padding
const ROW_HEIGHT = 150;
const GAP = 8;

export const Example: ChartsStory = () => {
  const data = useMemo(() => CASES.map(([, generate]) => generate()), []);
  const baseTheme = useBaseTheme();
  const isDarkTheme = useThemeId().includes('dark');
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gridAutoRows: ROW_HEIGHT,
        gap: GAP,
        height: '100%',
        overflow: 'auto',
      }}
    >
      {CASES.map(([name], row) =>
        CURVES.map(([curveName, curve]) => (
          <Chart key={`${name}, ${curveName}`} title={`${name}, ${curveName}`}>
            <Settings baseTheme={baseTheme} />
            <LineSeries
              id="line"
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor={0}
              yAccessors={[1]}
              data={data[row]!}
              curve={curve}
              color={isDarkTheme ? 'white' : 'black'}
              lineSeriesStyle={{ line: { strokeWidth: 0.5 } }}
            />
          </Chart>
        )),
      )}
    </div>
  );
};

Example.parameters = {
  // tall enough for every row of charts, in a box that can be resized
  resize: { height: CASES.length * ROW_HEIGHT + (CASES.length - 1) * GAP, maxHeight: 'none' },
};
