/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings, timeFormatter } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');

// Sine wave with random noise — produces realistic peaks and valleys for benchmarking
function generateTimeSeries(count: number): Array<[number, number]> {
  const rng = getRandomNumberGenerator();
  const data = new Array<[number, number]>(count);
  const start = Date.now() - count * 1000;
  for (let i = 0; i < count; i++) {
    data[i] = [start + i * 1000, Math.sin(i * 0.001) * 50 + rng(0, 10)];
  }
  return data;
}

const pointCountOptions: Record<string, number> = {
  '100K': 100_000,
  '500K': 500_000,
  '1M': 1_000_000,
  '5M': 5_000_000,
  '10M': 10_000_000,
};

export const Example: ChartsStory = (_, { title, description }) => {
  const pointCount = select('Point count', pointCountOptions, 100_000);
  const [data, setData] = useState<Array<[number, number]>>([]);
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const measured = useRef(false);

  useEffect(() => {
    const d = generateTimeSeries(pointCount);
    measured.current = false;
    setRenderTime(null);
    // Mark before the state update that triggers chart rendering
    window.performance.mark('Perf:Started');
    setData(d);
  }, [pointCount]);

  const theme = useBaseTheme();

  const onRenderChange = useCallback((isRendered: boolean) => {
    if (isRendered && !measured.current) {
      measured.current = true;
      window.performance.mark('Perf:Ended');
      const measure = window.performance.measure('Chart render', 'Perf:Started', 'Perf:Ended');
      setRenderTime(measure.duration);
    }
  }, []);

  if (data.length === 0) {
    return <div>Generating data...</div>;
  }

  return (
    <div>
      <div style={{ padding: 8, fontFamily: 'monospace', fontSize: 13 }}>
        Points: {pointCount.toLocaleString()}
        {renderTime !== null && <span> | Render: {renderTime.toFixed(0)}ms</span>}
      </div>
      <Chart title={title} description={description} size={{ height: 400 }}>
        <Settings baseTheme={theme} onRenderChange={onRenderChange} />
        <Axis id="bottom" position={Position.Bottom} tickFormat={dateFormatter} />
        <Axis id="left" position={Position.Left} tickFormat={(d) => Number(d).toFixed(0)} />
        <LineSeries
          id="series"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data}
        />
      </Chart>
    </div>
  );
};
