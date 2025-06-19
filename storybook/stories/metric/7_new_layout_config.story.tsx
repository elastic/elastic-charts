/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiFlexGroup, EuiFlexItem, EuiIcon } from '@elastic/eui';
import { action } from '@storybook/addon-actions';
import { select, boolean, text, color, number } from '@storybook/addon-knobs';
import React from 'react';

import type { MetricWProgress, MetricWTrend, MetricWText, MetricWNumber, TextAlign } from '@elastic/charts';
import { Chart, isMetricElementEvent, Metric, MetricTrendShape, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const getTextAlignKnob = (name: string, defaultValue: TextAlign, groupId?: string): TextAlign =>
  select(name, { Left: 'left', Center: 'center', Right: 'right' }, defaultValue, groupId);

const getIcon =
  (type: string) =>
  ({ width, height, color }: { width: number; height: number; color: string }) => (
    <EuiIcon type={type} width={width} height={height} fill={color} style={{ width, height }} />
  );

const sizeMap: Record<'small' | 'medium' | 'large', Array<{ height: string; width: string }>> = {
  small: [
    { height: '100px', width: '200px' },
    { height: '150px', width: '200px' },
    { height: '200px', width: '200px' },
    { height: '300px', width: '200px' },
  ],
  medium: [{ height: '400px', width: '400px' }],
  large: [
    { height: '600px', width: '600px' },
    { height: '700px', width: '700px' },
  ],
};

export const Example: ChartsStory = (_, { title: storyTitle, description }) => {
  // title and subtitle values
  const title = text('title', 'Count of records');
  const subtitle = text('subtitle', 'Litle description of this component');

  // Visualization type
  const progressOrTrend = select('progress or trend', { trend: 'trend', bar: 'bar', none: 'none' }, 'bar');
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
  const useValueColor = boolean('use value color', false);
  const valueColor = color('value color', '#3c3c3c');
  extra = extra.replace('&lt;b&gt;', '<b>');
  extra = extra.replace('&lt;/b&gt;', '</b>');

  const iconType = 'warning';

  // icon
  const showIcon = boolean('show icon', false);
  const iconAlign = select('icon align', { Left: 'left', Right: 'right' }, 'right');

  // value icon
  const showValueIcon = boolean('show value icon', false);
  const valueIconType = 'sortUp';

  const useBlendingBackground = boolean('use blending background', false);
  const blendingBackground = color('blending background', 'rgba(255,255,255,1)');

  const data = {
    color: metricColor,
    title,
    valueColor: useValueColor ? valueColor : undefined,
    subtitle,
    extra: <span dangerouslySetInnerHTML={{ __html: extra }}></span>,
    ...(showIcon ? { icon: getIcon(iconType) } : {}),
    ...(showValueIcon ? { valueIcon: getIcon(valueIconType) } : {}),
  };

  const numericData: MetricWProgress | MetricWNumber | MetricWTrend = {
    ...data,
    value: Number.parseFloat(value),
    valueFormatter: (d: number) => `${valuePrefix}${d}${valuePostfix}`,
    ...(progressOrTrend === 'bar' ? { domainMax: progressMax, progressBarDirection } : {}),
    ...(progressOrTrend === 'trend'
      ? {
          trend: KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
          trendShape,
          trendA11yTitle,
          trendA11yDescription,
        }
      : {}),
  };

  const textualData: MetricWText | MetricWTrend = {
    ...data,
    value,
    ...(progressOrTrend === 'bar' ? { domainMax: progressMax, progressBarDirection } : {}),
    ...(progressOrTrend === 'trend'
      ? {
          trend: KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
          trendShape,
          trendA11yTitle,
          trendA11yDescription,
        }
      : {}),
  };

  const onEventClickAction = action('click');
  const onEventOverAction = action('over');
  const onEventOutAction = action('out');

  const configuredData = [[numberTextSwitch ? numericData : textualData]];

  // Configurations

  const group1 = 'Text configuration and postion';

  // title and subtitle
  const titlesTextAlign = getTextAlignKnob('Title and subtitle alignment', 'left', group1);
  const titleWeight = select('Title weight', { Bold: 'bold', Regular: 'regular' }, 'regular', group1);
  // value (primary metric)
  const valuePosition = select('Primary metric position', { Bottom: 'bottom', Top: 'top' }, 'top', group1);
  const valueTextAlign = getTextAlignKnob('Primary metric alignment', 'left', group1);
  const valueFontSizeMode = select(
    'Primary metric font size mode',
    { Default: 'default', Fit: 'fit', Custom: 'custom' },
    'default',
    group1,
  );
  const valueFontSize = number(
    'Primary metric font size (only if custom font size selected)',
    40,
    { min: 0, step: 10 },
    group1,
  );
  // extra (secondary metric)
  const extraTextAlign = getTextAlignKnob('Extra element alignment', 'left', group1);

  const baseTheme = useBaseTheme();

  const breakpointShow = select('Show breakpoints', { Small: 'small', Medium: 'medium', Large: 'large' }, 'small');
  const breakpoints = sizeMap[breakpointShow];

  return (
    <EuiFlexGroup>
      {breakpoints.map(({ height, width }, i) => (
        <EuiFlexItem key={height} style={{ height, maxWidth: width }}>
          <Chart title={storyTitle} description={description}>
            <Settings
              theme={{
                metric: {
                  blendingBackground: useBlendingBackground ? blendingBackground : undefined,
                  valueFontSize: valueFontSizeMode === 'custom' ? valueFontSize : valueFontSizeMode,
                  titlesTextAlign,
                  valueTextAlign,
                  extraTextAlign,
                  iconAlign,
                  valuePosition,
                  titleWeight,
                },
              }}
              baseTheme={baseTheme}
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
            <Metric id={`${i}`} data={configuredData} />
          </Chart>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};
