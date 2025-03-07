/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiIcon } from '@elastic/eui';
import { action } from '@storybook/addon-actions';
import { select, number, boolean, button, color } from '@storybook/addon-knobs';
import React, { useEffect, useMemo, useState } from 'react';

import type { MetricDatum } from '@elastic/charts';
import { Chart, isMetricElementEvent, Metric, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();

function split(a: (any | undefined)[], size: number) {
  return Array.from(new Array(Math.ceil(a.length / size))).map((_, index) => a.slice(index * size, (index + 1) * size));
}

const getIcon =
  (type: string) =>
  ({ width, height, color }: { width: number; height: number; color: string }) => (
    <EuiIcon type={type} width={width} height={height} fill={color} style={{ width, height }} />
  );

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

const defaultValueFormatter = (d: number) => `${d}`;

export const Example: ChartsStory = (_, { title, description }) => {
  const showGridBorder = boolean('show grid border', false);
  const addMetricClick = boolean('attach click handler', true);
  const useProgressBar = boolean('use progress bar', true);

  const progressBarDirection = select('progress bar direction', ['horizontal', 'vertical'], 'vertical');
  const maxDataPoints = number('max trend data points', 30, { min: 0, max: 50, step: 1 });
  const emptyBackground = color('empty background', 'transparent');
  const valueFontSizeMode = select(
    'value font mode',
    {
      Default: 'default',
      Fit: 'fit',
      Custom: 'custom',
    },
    'default',
  );
  const valueFontSize = number('value font size (px)', 40, { min: 0, step: 10 });

  const data: (MetricDatum | undefined)[] = useMemo(
    () => [
      {
        color: '#3c3c3c',
        title: 'CPU Usage',
        subtitle: 'Overall percentage',
        icon: getIcon('compute'),
        value: NaN,
        valueFormatter: defaultValueFormatter,
        trend: KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
        trendShape: 'area',
        trendA11yTitle: 'Last hour CPU percentage trend',
        trendA11yDescription:
          'The trend shows the CPU Usage in percentage in the last hour. The trend shows a general flat behaviour with peaks every 10 minutes',
      },
      {
        color: '#FF7E62',
        title: 'Memory Usage',
        subtitle: 'Overall percentage',
        value: 33.57,
        valueFormatter: (d) => `${d} %`,
        trend: KIBANA_METRICS.metrics.kibana_memory.v1.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
        trendShape: 'area',
        trendA11yTitle: 'Last hour Memory usage trend',
        trendA11yDescription:
          'The trend shows the memory usage in the last hour. The trend shows a general flat behaviour across the entire time window',
      },
      {
        color: '#5e5e5e',
        title: 'Disk I/O',
        subtitle: 'Read',
        icon: getIcon('sortUp'),
        value: 12.57,
        valueFormatter: (d) => `${d} Mb/s`,
        ...(useProgressBar && {
          domainMax: 100,
          progressBarDirection,
          extra: (
            <span>
              max <b>100Mb/s</b>
            </span>
          ),
        }),
      },
      {
        color: '#5e5e5e',
        title: 'Disk I/O',
        subtitle: 'Write',
        icon: getIcon('sortDown'),
        value: 41.12,
        valueFormatter: (d) => `${d} Mb/s`,
        ...(useProgressBar && {
          domainMax: 100,
          progressBarDirection,
          extra: (
            <span>
              max <b>100Mb/s</b>
            </span>
          ),
        }),
      },
      {
        color: '#6DCCB1',
        title: '21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9',
        subtitle: 'Cluster CPU Usage',
        value: 24.85,
        valueFormatter: (d) => `${d}%`,
        trend: KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
        trendShape: 'area',
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
        icon: getIcon('sortUp'),
        value: 3.57,
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
        value: 323.57,
        valueFormatter: (d) => `$ ${d}k`,
        trend: KIBANA_METRICS.metrics.kibana_os_load.v3.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
        trendShape: 'area',
        trendA11yTitle: 'Last quarter, daily Cloud Revenue trend',
        trendA11yDescription:
          'The trend shows the daily Cloud revenue in the last quarter, showing peaks during weekends.',
      },
    ],
    [maxDataPoints, useProgressBar, progressBarDirection],
  );

  const nColumns = number('number of columns', 4, { min: 1, max: data.length, step: 1 });

  const [chartData, setChartData] = useState(arrayToGrid(data, nColumns));
  const [containerHeight, setContainerHeight] = useState(getContainerHeight(chartData));
  const [containerWidth, setContainerWidth] = useState(getContainerWidth(chartData));

  useEffect(() => {
    const newData = arrayToGrid(data, nColumns);
    setChartData(newData);
    setContainerHeight(getContainerHeight(newData));
    setContainerWidth(getContainerWidth(newData));
  }, [data, progressBarDirection, useProgressBar, maxDataPoints, nColumns]);

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
              valueFontSize: valueFontSizeMode === 'custom' ? valueFontSize : valueFontSizeMode,
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
