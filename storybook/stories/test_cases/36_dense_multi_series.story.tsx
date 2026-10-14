/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useEffect, useState } from 'react';

import { Axis, Chart, CurveType, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { noiseTable, sample } from '../utils/datasets/smooth_noise';

const SERIES_COUNT = 50;
const POINTS_PER_SERIES = 40_000;

const rng = getRandomNumberGenerator('line-multi-series');

type SeriesDatum = [x: number, y: number];

function generateData(seriesPoints: number, numSeries = 1): SeriesDatum[][] {
  return Array.from({ length: numSeries }, (_, seriesIndex) => {
    const trend = noiseTable(rng, 24);
    const swell = noiseTable(rng, 48);
    const ripple = noiseTable(rng, 96);
    const data = new Array<SeriesDatum>(seriesPoints);

    for (let i = 0; i < seriesPoints; i++) {
      const noise = sample(trend, i / 500) * 10 + sample(swell, i / 90) * 4 + sample(ripple, i / 18) * 1.2;
      data[i] = [i, seriesIndex * 3 + 4 * Math.sin((Math.PI * i) / (seriesPoints - 1)) ** 2 * noise];
    }

    return data;
  });
}

const PROFILE_LABEL = 'Perf:DataToRender';

export const Example: ChartsStory = (_, { title, description }) => {
  const [data, setData] = useState<SeriesDatum[][]>([]);
  const [runId, setRunId] = useState(0);
  useEffect(() => {
    const generatedData = generateData(POINTS_PER_SERIES, SERIES_COUNT);
    window.performance.mark('Perf:Started');
    setData(generatedData);
  }, [runId]);

  const baseTheme = useBaseTheme();
  const renderButton = (
    <button
      type="button"
      style={{ all: 'revert', alignSelf: 'flex-start' }} // it should look like a button, not just text
      onClick={() => {
        setData([]);
        setRunId(runId + 1);
      }}
    >
      Render
    </button>
  );
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {renderButton}
        <div style={{ marginTop: 4 }}>Rendering...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderButton}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Chart title={title} description={description}>
          <Settings
            showLegend
            legendPosition={Position.Right}
            baseTheme={baseTheme}
            onRenderChange={(isRendered) => {
              if (isRendered) {
                window.performance.mark('Perf:Ended');
                const { duration } = window.performance.measure(PROFILE_LABEL, 'Perf:Started', 'Perf:Ended');
                // eslint-disable-next-line no-console
                console.log(`chart rendered in ${duration.toFixed(0)} ms`);
              }
            }}
          />
          <Axis id="bottom" position={Position.Bottom} />
          <Axis id="left" position={Position.Left} />
          {data.map((seriesData, index) => (
            <LineSeries
              key={index}
              id={`series-${index + 1}`}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor={0}
              yAccessors={[1]}
              data={seriesData}
              curve={CurveType.LINEAR}
            />
          ))}
        </Chart>
      </div>
    </div>
  );
};
