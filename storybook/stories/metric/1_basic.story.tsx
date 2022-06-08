/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, text, color, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, CurveType, Metric, ProgressBarMode, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const verticalProgress = select(
    'progress bar orientation',
    { horizontal: 'horizontal', vertical: 'vertical' },
    'vertical',
  );
  const title = text('title', '21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9');
  const subtitle = text('subtitle', 'Cluster CPU usage');
  const progressOrTrend = select(
    'progress or trend',
    {
      trend: 'trend',
      'vertical bar': 'vertical bar',
      'horizontal bar': 'horizontal bar',
      none: 'none',
    },
    'trend',
  );
  const maxDataPoints = number('trend data points', 30, { min: 0, max: 50, step: 1 });
  const trendCurve = select(
    'trend curve shape',
    {
      [CurveType.LINEAR]: CurveType.LINEAR,
      [CurveType.CURVE_STEP_AFTER]: CurveType.CURVE_STEP_AFTER,
    },
    CurveType.LINEAR,
  );
  const trendA11yTitle = text('trend a11y title', 'The Cluster CPU Usage trend');
  const trendA11yDescription = text(
    'trend a11y description',
    'The trend shows a peak of CPU usage in the last 5 minutes',
  );

  const progressMin = number('progress min', 0);
  const progressMax = number('progress max', 100);
  const value = number('value', 55.23);
  const valuePrefix = text('value prefix', '');
  const valuePostfix = text('value postfix', ' %');
  const metricColor = color('color', '#3c3c3c');
  const isProgressBar = progressOrTrend === 'vertical bar' || progressOrTrend === 'horizontal bar';

  const data = {
    value,
    color: metricColor,
    title,
    subtitle,
    valueFormatter: (d: number) => `${valuePrefix}${d}${valuePostfix}`,
    ...(isProgressBar ? { domain: { min: progressMin, max: progressMax } } : {}),
    ...(progressOrTrend === 'trend'
      ? {
          trend: KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
          trendCurve,
          trendA11yTitle,
          trendA11yDescription,
        }
      : {}),
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
        <Metric
          id="1"
          data={[[data]]}
          progressBarMode={isProgressBar ? ProgressBarMode.Small : ProgressBarMode.None}
          progressBarOrientation={verticalProgress}
        />
      </Chart>
    </div>
  );
};
