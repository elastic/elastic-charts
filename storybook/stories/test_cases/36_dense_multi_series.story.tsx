/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useMemo, useRef, useState } from 'react';

import { Axis, Chart, CurveType, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const SERIES_COUNT = 50;
const POINTS_PER_SERIES = 40_000;

const rng = getRandomNumberGenerator('line-multi-series');

type SeriesDatum = [x: number, y: number];

function noiseTable(size: number) {
  return Array.from({ length: size }, () => rng(0, 1, 4));
}

function sample(table: number[], x: number) {
  const i = Math.floor(x);
  const t = x - i;
  const s = t * t * (3 - 2 * t);
  const n = table.length;
  return table[i % n]! + (table[(i + 1) % n]! - table[i % n]!) * s;
}

function generateData(seriesPoints: number, numSeries = 1): SeriesDatum[][] {
  return Array.from({ length: numSeries }, (_, seriesIndex) => {
    const trend = noiseTable(24);
    const swell = noiseTable(48);
    const ripple = noiseTable(96);
    const data = new Array<SeriesDatum>(seriesPoints);

    for (let i = 0; i < seriesPoints; i++) {
      const noise = sample(trend, i / 500) * 10 + sample(swell, i / 90) * 4 + sample(ripple, i / 18) * 1.2;
      data[i] = [i, seriesIndex * 3 + 4 * Math.sin((Math.PI * i) / (seriesPoints - 1)) ** 2 * noise];
    }

    return data;
  });
}

const RENDER_LABEL = 'chart-render';

export const Example: ChartsStory = (_, { title, description }) => {
  const seriesData = useMemo(() => generateData(POINTS_PER_SERIES, SERIES_COUNT), []);
  const [runId, setRunId] = useState(0);
  const pendingTimer = useRef(false);
  const baseTheme = useBaseTheme();

  const startRender = () => {
    window.performance.mark(`${RENDER_LABEL}:start`);
    pendingTimer.current = true;
    setRunId((id) => id + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <button type="button" style={{ all: 'revert', alignSelf: 'flex-start' }} onClick={startRender}>
        Render
      </button>
      <div style={{ flex: 1, minHeight: 0 }}>
        {runId > 0 && (
          <Chart key={runId} title={title} description={description}>
            <Settings
              showLegend
              legendPosition={Position.Right}
              baseTheme={baseTheme}
              onRenderChange={(isRendered) => {
                if (isRendered && pendingTimer.current) {
                  pendingTimer.current = false;
                  const { duration } = window.performance.measure(RENDER_LABEL, `${RENDER_LABEL}:start`);
                  // eslint-disable-next-line no-console
                  console.log(`${RENDER_LABEL}: ${duration.toFixed(0)} ms`);
                }
              }}
            />
            <Axis id="bottom" position={Position.Bottom} />
            <Axis id="left" position={Position.Left} />
            {seriesData.map((data, index) => (
              <LineSeries
                key={index}
                id={`series-${index + 1}`}
                xScaleType={ScaleType.Linear}
                yScaleType={ScaleType.Linear}
                xAccessor={0}
                yAccessors={[1]}
                data={data}
                curve={CurveType.LINEAR}
              />
            ))}
          </Chart>
        )}
      </div>
    </div>
  );
};
