/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiIcon } from '@elastic/eui';
import { select, boolean, text, color, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Metric, MetricTrendShape, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { getKnobsFromEnum } from '../utils/knobs';

export const Example = () => {
  const title = text('title', '21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9');
  const subtitle = text('subtitle', 'Cluster CPU usage');
  const progressOrTrend = select(
    'progress or trend',
    {
      trend: 'trend',
      bar: 'bar',
      none: 'none',
    },
    'trend',
  );
  const progressBarDirection = select(
    'progress bar direction',
    { horizontal: 'horizontal', vertical: 'vertical' },
    'vertical',
  );
  const maxDataPoints = number('trend data points', 30, { min: 0, max: 50, step: 1 });
  const trendShape = getKnobsFromEnum('trend shape', MetricTrendShape, MetricTrendShape.Area as MetricTrendShape);
  const trendA11yTitle = text('trend a11y title', 'The Cluster CPU Usage trend');
  const trendA11yDescription = text(
    'trend a11y description',
    'The trend shows a peak of CPU usage in the last 5 minutes',
  );

  let extra = text('extra', 'last <b>5m</b>');
  const progressMin = number('progress min', 0);
  const progressMax = number('progress max', 100);
  const value = number('value', 55.23);
  const valuePrefix = text('value prefix', '');
  const valuePostfix = text('value postfix', ' %');
  const metricColor = color('color', '#3c3c3c');
  extra = extra.replace('&lt;b&gt;', '<b>');
  extra = extra.replace('&lt;/b&gt;', '</b>');
  const showIcon = boolean('show icon', false);
  const iconType = text('EUI icon glyph name', 'alert');
  const getIcon = (type: string) => ({ width, height, color }: { width: number; height: number; color: string }) => (
    <EuiIcon type={type} width={width} height={height} fill={color} style={{ width, height }} />
  );
  const data = {
    value,
    color: metricColor,
    title,
    subtitle,
    valueFormatter: (d: number) => `${valuePrefix}${d}${valuePostfix}`,
    extra: <span dangerouslySetInnerHTML={{ __html: extra }}></span>,
    ...(progressOrTrend === 'bar' ? { domain: { min: progressMin, max: progressMax }, progressBarDirection } : {}),
    ...(progressOrTrend === 'trend'
      ? {
          trend: KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
          trendShape,
          trendA11yTitle,
          trendA11yDescription,
        }
      : {}),
    ...(showIcon ? { icon: getIcon(iconType) } : {}),
  };

  return (
    <div
      style={{
        resize: 'both',
        padding: '0px',
        overflow: 'auto',
        height: '200px',
        width: '200px',
      }}
    >
      <Chart>
        <Settings baseTheme={useBaseTheme()} />
        <Metric id="1" data={[[data]]} />
      </Chart>
    </div>
  );
};
