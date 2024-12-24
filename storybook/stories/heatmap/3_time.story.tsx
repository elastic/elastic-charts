/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';

import {
  Chart,
  Heatmap,
  RecursivePartial,
  ScaleType,
  Settings,
  HeatmapStyle,
  DEFAULT_CHART_MARGINS,
} from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();
const start = DateTime.fromISO('2021-03-27T20:00:00', { zone: 'UTC' });
const end = DateTime.fromISO('2021-03-28T11:00:00', { zone: 'UTC' });
const data = [...new Array(14)].flatMap((d, i) => {
  return [
    [start.plus({ hour: i }).toMillis(), 'cat A', rng(-5, 5)],
    [start.plus({ hour: i }).toMillis(), 'cat B', rng(-5, 5)],
    [start.plus({ hour: i }).toMillis(), 'cat C', rng(-5, 5)],
    [start.plus({ hour: i }).toMillis(), 'cat D', rng(-5, 5)],
    [start.plus({ hour: i }).toMillis(), 'cat E', rng(-5, 5)],
  ];
});

export const Example: ChartsStory = (_, { title, description }) => {
  const heatmap = useMemo(() => {
    const styles: RecursivePartial<HeatmapStyle> = {
      grid: {
        stroke: {
          width: 0.5,
          color: 'transparent',
        },
      },
      cell: {
        maxWidth: 'fill',
        maxHeight: 3,
        label: {
          visible: false,
        },
        border: {
          stroke: 'transparent',
          strokeWidth: 0,
        },
      },
      yAxisLabel: {
        visible: true,
        width: 'auto',
        padding: { left: 10, right: 10 },
      },
    };

    return styles;
  }, []);

  const startTimeOffset = number('start time offset', 0, {
    min: -1000 * 60 * 60 * 24,
    max: 1000 * 60 * 60 * 10,
    step: 1000,
    range: true,
  });
  const endTimeOffset = number('end time offset', 0, {
    min: -1000 * 60 * 60 * 10,
    max: 1000 * 60 * 60 * 24,
    step: 1000,
    range: true,
  });

  return (
    <>
      <div style={{ fontFamily: 'monospace', fontSize: 10, paddingBottom: 5 }}>
        {DateTime.fromMillis(start.toMillis() + startTimeOffset).toISO()} to{' '}
        {DateTime.fromMillis(end.toMillis() + endTimeOffset).toISO()}
      </div>
      <Chart title={title} description={description} size={['100%', 180]} className="story-chart">
        <Settings
          showLegend
          xDomain={{
            min: start.toMillis() + startTimeOffset,
            max: end.toMillis() + endTimeOffset,
          }}
          theme={{ heatmap }}
          baseTheme={{ ...useBaseTheme(), chartMargins: DEFAULT_CHART_MARGINS }}
        />
        <Heatmap
          id="heatmap1"
          colorScale={{
            type: 'bands',
            bands: [
              { color: '#ca0020', start: -5, end: -3 },
              { color: '#f4a582', start: -3, end: -1 },
              { color: '#cecece', start: -1, end: 1 },
              { color: '#92c5de', start: 1, end: 3 },
              { color: '#0571b0', start: 3, end: 5 },
            ],
            labelFormatter: (s, e) => `[${s}, ${e})`,
          }}
          data={data}
          xAccessor={(d) => d[0]}
          yAccessor={(d) => d[1]}
          valueAccessor={(d) => d[2]}
          valueFormatter={(d) => d.toFixed(2)}
          ySortPredicate="numAsc"
          xAxisLabelFormatter={(value) => {
            return DateTime.fromMillis(value as number)
              .setZone('UTC')
              .toFormat('HH:mm:ss');
          }}
          timeZone="UTC"
          xScale={{
            type: ScaleType.Time,
            interval: {
              type: 'fixed',
              unit: 'h',
              value: 1,
            },
          }}
        />
      </Chart>
    </>
  );
};
