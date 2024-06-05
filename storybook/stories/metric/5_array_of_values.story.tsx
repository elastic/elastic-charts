/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { number, boolean, button, color, select } from '@storybook/addon-knobs';
import React, { useEffect, useMemo, useState } from 'react';

import { Chart, isMetricElementEvent, Metric, MetricDatum, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();

function split(a: (any | undefined)[], size: number) {
  return Array.from(new Array(Math.ceil(a.length / size))).map((_, index) => a.slice(index * size, (index + 1) * size));
}

const arrayToGrid: <T>(array: T[], nColumns: number) => T[][] = (array, nColumns) => {
  const ret = [];
  for (let i = 0; i < array.length; i += nColumns) {
    ret.push(array.slice(i, i + nColumns));
  }
  return ret;
};

const maxTileSideLength = 200;
const getContainerWidth = (_data: (MetricDatum | undefined)[][]) => _data[0].length * maxTileSideLength;
const getContainerHeight = (_data: (MetricDatum | undefined)[][]) => _data.length * maxTileSideLength;

export const Example: ChartsStory = (_, { title, description }) => {
  const showGridBorder = boolean('show grid border', false);
  const addMetricClick = boolean('attach click handler', true);
  const maxDataPoints = number('max trend data points', 30, { min: 0, max: 50, step: 1 });
  const emptyBackground = color('empty background', 'transparent');
  const valueFontSizeMode = select(
    'value font mode',
    {
      Default: 'default',
      Auto: 'auto',
      Custom: 'custom',
    },
    'default',
  );
  const valueFontSize = number('value font size (px)', 40, { min: 0, step: 10 });

  const data = useMemo<(MetricDatum | undefined)[]>(
    () => [
      {
        color: '#3c3c3c',
        title: 'Top machines',
        subtitle: 'Greatest throughput by ip',
        value: ['28.86.156.19', '', '103.23.205.126'],
        trend: KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
        trendShape: 'area',
      },
      {
        color: '#FF7E62',
        title: 'Memory Usage',
        subtitle: 'Overall percentages',
        value: [33.57],
        valueFormatter: (d) => `${d}%`,
      },
      {
        color: '#5e5e5e',
        title: 'Disk I/O',
        subtitle: 'Write',
        value: [4, 9],
        valueFormatter: (d) => `${d} Mb/s`,
        extra: (
          <span>
            max <b>100 Mb/s</b>
          </span>
        ),
      },
      {
        color: '#FFBDAF',
        title: 'Inbound Traffic',
        subtitle: 'Network eth0',
        extra: (
          <span>
            last <b>5m</b>
          </span>
        ),
        value: [3, 1],
        valueFormatter: (d) => `${d}KBps`,
      },
      undefined,
      {
        color: '#F1D86F',
        title: 'Cloud Revenue',
        subtitle: 'Quarterly',
        extra: (
          <span>
            This Year <b>10M</b>
          </span>
        ),
        value: [32, NaN, 2],
        valueFormatter: (d) => `$${d}k`,
        trend: KIBANA_METRICS.metrics.kibana_os_load.v3.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
        trendShape: 'bars',
      },
    ],
    [maxDataPoints],
  );

  const nColumns = number('number of columns', 3, { min: 1, max: data.length, step: 1 });

  const [chartData, setChartData] = useState(arrayToGrid(data, nColumns));
  const [containerHeight, setContainerHeight] = useState(getContainerHeight(chartData));
  const [containerWidth, setContainerWidth] = useState(getContainerWidth(chartData));

  useEffect(() => {
    const newData = arrayToGrid(data, nColumns);
    setChartData(newData);
    setContainerHeight(getContainerHeight(newData));
    setContainerWidth(getContainerWidth(newData));
  }, [data, maxDataPoints, nColumns]);

  button('randomize data', () => {
    setChartData(
      split(
        data
          .slice()
          .map((d) => {
            return rng(0, 1, 3) > 0.8 ? undefined : d;
          })
          .slice(0, rng(1, data.length)),
        rng(1, data.length / 2),
      ),
    );
  });
  const debugRandomizedData = boolean('debug randomized data', false);

  const onEventClickAction = action('click');
  const onEventOverAction = action('over');
  const onEventOutAction = action('out');
  return (
    <div
      style={{
        resize: 'both',
        maxWidth: '100%',
        maxHeight: '80vh',
        padding: '0px',
        overflow: 'auto',
        height: `${containerHeight}px`,
        width: `${containerWidth}px`,
        ...(showGridBorder && {
          boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
          borderRadius: '6px',
        }),
      }}
    >
      {debugRandomizedData &&
        chartData
          .flat()
          .map((d) => `[${d?.value}]`)
          .join(' ')}
      <Chart title={title} description={description}>
        <Settings
          theme={{
            metric: {
              emptyBackground,
              text: {
                valueFontSize: valueFontSizeMode === 'custom' ? valueFontSize : valueFontSizeMode,
              },
            },
          }}
          baseTheme={useBaseTheme()}
          onElementClick={
            addMetricClick
              ? ([d]) => {
                  if (isMetricElementEvent(d)) {
                    const { rowIndex, columnIndex } = d;
                    onEventClickAction(
                      `row:${rowIndex} col:${columnIndex} value:${chartData[rowIndex][columnIndex]?.value}`,
                    );
                  }
                }
              : undefined
          }
          onElementOver={([d]) => {
            if (isMetricElementEvent(d)) {
              const { rowIndex, columnIndex } = d;
              onEventOverAction(`row:${rowIndex} col:${columnIndex} value:${chartData[rowIndex][columnIndex]?.value}`);
            }
          }}
          onElementOut={() => onEventOutAction('out')}
        />
        <Metric id="metric" data={chartData} />
      </Chart>
    </div>
  );
};
