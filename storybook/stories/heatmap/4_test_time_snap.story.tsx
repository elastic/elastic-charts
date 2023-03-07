/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import { extent } from 'd3-array';
import { DateTime } from 'luxon';
import React from 'react';

import { Chart, Heatmap, PartialTheme, ScaleType, Settings } from '@elastic/charts';

import { ColorBand } from '../../../packages/charts/src/chart_types/heatmap/specs/heatmap';
import {
  DATA_1,
  DATA_2,
  DATA_3,
  DATA_4,
  DATA_5,
  DATA_6,
  DATA_7,
  DATA_8,
  DATA_9,
} from '../../../packages/charts/src/utils/data_samples/test_dataset_heatmap';
import { useBaseTheme } from '../../use_base_theme';

const datasets = [DATA_1, DATA_2, DATA_3, DATA_4, DATA_5, DATA_6, DATA_7, DATA_8, DATA_9];

const theme: PartialTheme = {
  heatmap: {
    grid: {
      stroke: {
        width: 1,
        color: 'black',
      },
    },
    cell: {
      maxWidth: 'fill',
      maxHeight: 3,
      label: {
        visible: true,
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
    xAxisLabel: {
      padding: { top: 4, bottom: 4 },
    },
  },
};

export const Example = () => {
  const datasetIndex = select('dataset', [1, 2, 3, 4, 5, 6, 7, 8, 9], 1) - 1;
  const dataset = datasets[datasetIndex];
  const [min = 0, max = 0] = extent(dataset.data, (d) => d.value);
  const colors = ['#ca0020', '#f4a582', '#cecece', '#92c5de', '#0571b0'];
  const numOfColors = colors.length;
  const interval = (max - min) / numOfColors;

  const colorBands = Array.from<unknown, ColorBand>({ length: numOfColors }, (d, i) => ({
    color: colors[i],
    start: Math.floor(min + i * interval),
    end: i === numOfColors - 1 ? Infinity : Math.ceil(min + (i + 1) * interval),
  }));
  const [tMin = 0, tMax = 0] = extent(dataset.data, (d) => d.x);
  return (
    <>
      <div style={{ fontFamily: 'monospace', fontSize: 10, paddingBottom: 5 }}>
        {DateTime.fromMillis(tMin).toISO()} to {DateTime.fromMillis(tMax).toISO()}{' '}
        {`${dataset.interval.type}: ${dataset.interval.value}${dataset.interval.unit} points:${dataset.data.length}`}
      </div>
      <Chart className="story-chart">
        <Settings theme={theme} baseTheme={useBaseTheme()} xDomain={dataset.domain} />
        <Heatmap
          id="heatmap1"
          colorScale={{
            type: 'bands',
            bands: colorBands,
            labelFormatter: (s, e) => `[${s}, ${e})`,
          }}
          data={dataset.data}
          xAccessor="x"
          yAccessor="y"
          valueAccessor="value"
          ySortPredicate="numAsc"
          xScale={{
            type: ScaleType.Time,
            interval: dataset.interval,
          }}
          timeZone={dataset.timeZone ?? 'Europe/Rome'}
          xAxisLabelFormatter={dataset.xFormatter}
        />
      </Chart>
    </>
  );
};
