/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiIcon } from '@elastic/eui';
import { action } from '@storybook/addon-actions';
import { select, boolean, text, color, number } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  isMetricElementEvent,
  Metric,
  MetricTrendShape,
  MetricWProgress,
  MetricWTrend,
  MetricWText,
  MetricWNumber,
  Settings,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

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
  const trendShape = customKnobs.fromEnum('trend shape', MetricTrendShape, MetricTrendShape.Area);
  const trendA11yTitle = text('trend a11y title', 'The Cluster CPU Usage trend');
  const trendA11yDescription = text(
    'trend a11y description',
    'The trend shows a peak of CPU usage in the last 5 minutes',
  );

  let extra = text('extra', 'last <b>5m</b>');
  const progressMax = number('progress max', 100);
  const numberTextSwitch = boolean('is numeric metric', true);
  const value = text('value', '55.23');
  const valuePrefix = text('value prefix', '');
  const valuePostfix = text('value postfix', ' %');
  const metricColor = color('color', '#3c3c3c');
  extra = extra.replace('&lt;b&gt;', '<b>');
  extra = extra.replace('&lt;/b&gt;', '</b>');
  const showIcon = boolean('show icon', false);
  const iconType = text('EUI icon glyph name', 'alert');
  const getIcon =
    (type: string) =>
    ({ width, height, color }: { width: number; height: number; color: string }) =>
      <EuiIcon type={type} width={width} height={height} fill={color} style={{ width, height }} />;
  const data = {
    color: metricColor,
    title,
    subtitle,
    extra: <span dangerouslySetInnerHTML={{ __html: extra }}></span>,
    ...(showIcon ? { icon: getIcon(iconType) } : {}),
  };

  const numericData: MetricWProgress | MetricWNumber | MetricWTrend = {
    ...data,
    value: Number.parseFloat(value),
    valueFormatter: (d: number) => `${valuePrefix}${d}${valuePostfix}`,
    ...(progressOrTrend === 'bar' ? { domainMax: progressMax, progressBarDirection } : {}),
    ...(progressOrTrend === 'trend'
      ? {
          trend: KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
          trendShape,
          trendA11yTitle,
          trendA11yDescription,
        }
      : {}),
  };
  const textualData: MetricWText = {
    ...data,
    value,
  };

  const onEventClickAction = action('click');
  const onEventOverAction = action('over');
  const onEventOutAction = action('out');

  const configuredData = [[numberTextSwitch ? numericData : textualData]];
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
        <Settings
          baseTheme={useBaseTheme()}
          onElementClick={([d]) => {
            if (isMetricElementEvent(d)) {
              const { rowIndex, columnIndex } = d;
              onEventClickAction(
                `row:${rowIndex} col:${columnIndex} value:${configuredData[rowIndex][columnIndex].value}`,
              );
            }
          }}
          onElementOver={([d]) => {
            if (isMetricElementEvent(d)) {
              const { rowIndex, columnIndex } = d;
              onEventOverAction(
                `row:${rowIndex} col:${columnIndex} value:${configuredData[rowIndex][columnIndex].value}`,
              );
            }
          }}
          onElementOut={() => onEventOutAction('out')}
        />
        <Metric id="1" data={configuredData} />
      </Chart>
    </div>
  );
};
