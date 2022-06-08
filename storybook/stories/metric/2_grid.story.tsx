/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Metric, MetricBase, MetricWProgress, MetricWTrend, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

function split(a: (any | undefined)[], size: number) {
  return Array.from(new Array(Math.ceil(a.length / size))).map((_, index) => a.slice(index * size, (index + 1) * size));
}

export const Example = () => {
  const smallProgress = select(
    'progress bar',
    {
      small: 'small',
      none: 'none',
    },
    'small',
  );
  const verticalProgress = select(
    'progress bar orientation',
    { horizontal: 'horizontal', vertical: 'vertical' },
    'vertical',
  );
  const maxDataPoints = number('max trend data points', 30, { min: 0, max: 50, step: 1 });

  const defaultValueFormatter = (d: number) => `${d}`;
  const data: (MetricBase | MetricWProgress | MetricWTrend | undefined)[] = [
    {
      value: NaN,
      color: '#3c3c3c',
      title: 'CPU Usage',
      subtitle: 'Overall percentage',
      trend: KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
      trendA11yTitle: 'Last hour CPU percentage trend',
      trendA11yDescription:
        'The trend shows the CPU Usage in percentage in the last hour. The trend shows a general flat behaviour with peaks every 10 minutes',
      valueFormatter: defaultValueFormatter,
    },
    {
      value: 33.57,
      color: '#FF7E62',
      title: 'Memory Usage',
      subtitle: 'Overall percentage',
      trend: KIBANA_METRICS.metrics.kibana_memory[0].data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
      trendA11yTitle: 'Last hour Memory usage trend',
      trendA11yDescription:
        'The trend shows the memory usage in the last hour. The trend shows a general flat behaviour across the entire time window',
      valueFormatter: (d) => `${d} %`,
    },
    {
      value: 12.57,
      color: '#5e5e5e',
      domain: { min: 0, max: 100 },
      title: 'Disk I/O',
      subtitle: 'Read',
      valueFormatter: (d) => `${d} Mb/s`,
    },
    {
      value: 24.85,
      color: '#6DCCB1',
      title: '21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9',
      subtitle: 'Cluster CPU Usage',
      trend: KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
      valueFormatter: (d) => `${d}%`,
    },
    {
      value: 3.57,
      domain: { min: 0, max: 3.57 },
      color: '#FFBDAF',
      title: 'Inbound Traffic',
      subtitle: 'Network eth0',
      valueFormatter: (d) => `${d}KBps`,
      extra: (
        <span>
          last <b>5m</b>
        </span>
      ),
    },
    {
      value: 453.57,
      color: '#E7664C',
      domain: { min: 0, max: 453.57 },
      title: 'Outbound Traffic',
      subtitle: 'Network eth0',
      valueFormatter: (d) => `${d}MBps`,
      extra: (
        <span>
          last <b>5m</b>
        </span>
      ),
    },
    undefined,
    {
      value: 323.57,
      color: '#F1D86F',
      title: 'Cloud Revenue',
      subtitle: 'Quarterly',
      trend: KIBANA_METRICS.metrics.kibana_os_load[2].data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
      trendA11yTitle: 'Last quarter, daily Cloud Revenue trend',
      trendA11yDescription:
        'The trend shows the daily Cloud revenue in the last quarter, showing peaks during weekends.',
      extra: (
        <span>
          This Year <b>10M</b>
        </span>
      ),
      valueFormatter: (d) => `$ ${d}k`,
    },
  ];

  const displayOrientation = select('orientation', ['vertical', 'horizontal', 'grid'], 'grid');
  const configuredData =
    displayOrientation === 'grid'
      ? split(data, 4)
      : displayOrientation === 'horizontal'
      ? [data.slice(0, 4)]
      : split(data.slice(0, 4), 1);
  return (
    <div
      style={{
        resize: 'both',
        padding: '0px',
        overflow: 'auto',
        height: displayOrientation === 'vertical' ? '720px' : displayOrientation === 'horizontal' ? '150px' : '300px',
        width: displayOrientation === 'vertical' ? '180px' : '720px',
      }}
    >
      <Chart>
        <Settings baseTheme={useBaseTheme()} />
        <Metric
          id="1"
          data={configuredData}
          progressBarMode={smallProgress}
          progressBarOrientation={verticalProgress}
        />
      </Chart>
    </div>
  );
};
