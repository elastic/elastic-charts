/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, text, color, number } from '@storybook/addon-knobs';
import React from 'react';

import type { MetricWProgress, MetricWTrend, MetricWText, MetricWNumber } from '@elastic/charts';
import { Chart, isMetricElementEvent, Metric, MetricTrendShape, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title: storyTitle, description }) => {
  const maxDataPoints = number('trend data points', 30, { min: 0, max: 50, step: 1 });
  const nSeries = number('number of series', 3, { min: 0, max: 10, step: 1 });

  const canHaveNullValues = boolean('can have null values', false);
  const alignSeriesGaps = boolean('align gaps', false);
  const trendShape = customKnobs.fromEnum('trend shape', MetricTrendShape, MetricTrendShape.Area);

  const numberTextSwitch = boolean('is numeric metric', true);
  const value = text('value', '55.23');
  const metricColor = color('color', '#3c3c3c');

  const data = {
    color: metricColor,
    title: '21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9',
    subtitle: 'Cluster CPU usage',
  };

  const assignResetValue = (seriesIndex: number, datumIndex: number, y: number) => {
    if (alignSeriesGaps && datumIndex % nSeries) {
      return y;
    }
    if (datumIndex % (seriesIndex + 3)) {
      return y;
    }
    return canHaveNullValues ? null : 0;
  };

  const trendSingleData = KIBANA_METRICS.metrics.kibana_os_load.v2.data
    .slice(0, maxDataPoints)
    .map(([x, y]) => ({ x, y }));

  const trendData = new Array(nSeries)
    .fill(null)
    .flatMap((_, i) => trendSingleData.map(({ x, y }, n) => ({ x, y: assignResetValue(i, n, y) })));

  const trendProps = {
    trend: trendData,
    trendShape,
    trendA11yTitle: 'The Cluster CPU Usage trend',
    trendA11yDescription: 'The trend shows a peak of CPU usage in the last 5 minutes',
  };

  const numericData: MetricWProgress | MetricWNumber | MetricWTrend = {
    ...data,
    value: Number.parseFloat(value),
    valueFormatter: (d: number) => String(d),
    ...trendProps,
  };
  const textualData: MetricWText | MetricWTrend = {
    ...data,
    value,
    ...trendProps,
  };

  const onEventClickAction = action('click');
  const onEventOverAction = action('over');
  const onEventOutAction = action('out');

  const configuredData = [[numberTextSwitch ? numericData : textualData]];
  return (
    <Chart title={storyTitle} description={description}>
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
  );
};

Example.parameters = {
  resize: {
    height: '200px',
    width: '200px',
  },
};
