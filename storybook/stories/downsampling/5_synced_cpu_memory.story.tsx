/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useMemo, useRef } from 'react';

import type { PointerEvent } from '@elastic/charts';
import {
  Axis,
  Chart,
  CurveType,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  Tooltip,
  TooltipType,
} from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme, useThemeId } from '../../use_base_theme';
import { noiseTable, sample } from '../utils/datasets/smooth_noise';

// the regimes of both series, by x in seconds:
//      0 -  832  points joined by lines, without rows between them
//    833 - 1666  points, each kept isolated by a null row on either side, without other rows
//   1667 - 3332  continuous, a row every second
//   3333 - 8332  gaps: runs of null rows, some in both series, some in either one
//   8333 - 9999  isolated points, with a null row in each of the other seconds

type SeriesDatum = [x: number, y: number | null];

const ROWS = 10000; // one row per second
const CPU_MAX = 5;
const MEMORY_MAX = 10_000_000;
const ISOLATED_FROM = 833;
const CONTINUOUS_FROM = 1667;
const GAPPY_FROM = 3333;
const POINTY_FROM = 8333;
const POINT_EVERY = 50;

// runs of missing seconds in the gappy part, from 1 to 150 s long, as [from, to) pairs
function gaps(seed: string): Array<[number, number]> {
  const rng = getRandomNumberGenerator(seed);
  const runs: Array<[number, number]> = [];
  for (let from = GAPPY_FROM + rng(0, 300); from < POINTY_FROM; from += rng(150, 700)) {
    const to = Math.min(from + rng(1, 150), POINTY_FROM);
    runs.push([from, to]);
    from = to;
  }
  return runs;
}

// the gaps of both series, besides the gaps of either one, which sometimes overlap
const sharedGaps = gaps('synced-shared-gaps');

// the points of the first and last sixth, every POINT_EVERY seconds from the start of the part, in turn: only cpu,
// only memory, both at the same second, and both a second apart, which nearly always falls into one pixel column
function isPoint(series: 'cpu' | 'memory', sinceStart: number) {
  const offset = sinceStart % POINT_EVERY;
  switch (Math.floor(sinceStart / POINT_EVERY) % 4) {
    case 0:
      return series === 'cpu' && offset === 0;
    case 1:
      return series === 'memory' && offset === 0;
    case 2:
      return offset === 0;
    default:
      return offset === (series === 'cpu' ? 0 : 1);
  }
}

// a smooth level with noise on top, between 5% and 95% of max, so M4 keeps different rows of each series, without
// other rows than the points of the first sixth and the nulls keeping its second half's points isolated, and null in
// the gaps and between the isolated points of the last sixth
function usage(series: 'cpu' | 'memory', max: number, fractionDigits: number): SeriesDatum[] {
  const rng = getRandomNumberGenerator(`synced-${series}`);
  const trend = noiseTable(rng, 12);
  const seriesGaps = [...sharedGaps, ...gaps(`synced-${series}-gaps`)];
  return Array.from({ length: ROWS }, (_, x): SeriesDatum[] => {
    // every second draws from rng, so each part keeps its values whatever the other parts do
    const level = (0.3 + 0.4 * sample(trend, x / 800)) * max;
    const y = Number((level + rng(-0.25 * max, 0.25 * max, fractionDigits)).toFixed(fractionDigits));
    if (x < CONTINUOUS_FROM) {
      if (isPoint(series, x)) return [[x, y]];
      const isNextToPoint = isPoint(series, x - 1) || isPoint(series, x + 1);
      return x >= ISOLATED_FROM && isNextToPoint ? [[x, null]] : [];
    }
    const isMissing =
      x < POINTY_FROM ? seriesGaps.some(([from, to]) => x >= from && x < to) : !isPoint(series, x - POINTY_FROM);
    return [[x, isMissing ? null : y]];
  }).flat();
}

export const Example: ChartsStory = () => {
  const cpu = useMemo(() => usage('cpu', CPU_MAX, 3), []);
  const memory = useMemo(() => usage('memory', MEMORY_MAX, 0), []);
  const cpuChart = useRef<Chart>(null);
  const memoryChart = useRef<Chart>(null);
  const baseTheme = useBaseTheme();
  const isDarkTheme = useThemeId().includes('dark');

  const pointerUpdate = (event: PointerEvent) => {
    cpuChart.current?.dispatchExternalPointerEvent(event);
    memoryChart.current?.dispatchExternalPointerEvent(event);
  };

  // the y tick labels of the two charts differ in width, so their plot areas start at different x offsets
  const charts = [
    { id: 'cpu', title: 'CPU load', ref: cpuChart, data: cpu, max: CPU_MAX },
    { id: 'memory', title: 'Memory (bytes)', ref: memoryChart, data: memory, max: MEMORY_MAX },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16, height: '100%' }}>
      {charts.map(({ id, title, ref, data, max }) => (
        <Chart key={id} id={id} title={title} ref={ref}>
          <Settings
            baseTheme={baseTheme}
            pointerUpdateDebounce={0}
            onPointerUpdate={pointerUpdate}
            externalPointerEvents={{ tooltip: { visible: true } }}
            // the first rows of the two series differ, but the charts span the same seconds
            xDomain={{ min: 0, max: ROWS - 1 }}
          />
          {/* the tooltips show the exact x and y of the hovered and the synced rows */}
          <Tooltip type={TooltipType.VerticalCursor} />
          <Axis id="x" position={Position.Bottom} title="seconds" />
          <Axis id="y" position={Position.Left} domain={{ min: 0, max }} />
          <LineSeries
            id={id}
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[1]}
            data={data}
            color={isDarkTheme ? 'white' : 'black'}
            curve={CurveType.CURVE_STEP_AFTER}
            lineSeriesStyle={{ line: { strokeWidth: 0.25 } }}
          />
        </Chart>
      ))}
    </div>
  );
};

Example.parameters = {
  resize: { height: 640, maxHeight: 'none' },
};
