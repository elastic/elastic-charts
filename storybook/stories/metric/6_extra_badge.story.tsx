/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiBadge, EuiFlexGroup, EuiFlexItem, EuiIcon } from '@elastic/eui';
import { action } from '@storybook/addon-actions';
import { select, boolean, text, color, number } from '@storybook/addon-knobs';
import React from 'react';

import type { MetricWProgress, MetricWTrend, MetricWNumber } from '@elastic/charts';
import { Chart, isMetricElementEvent, Metric, MetricTrendShape, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title: storyTitle, description }) => {
  const title = text('title', '21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9');
  const subtitle = text('subtitle', 'Cluster CPU usage');

  const extraText = text('extra', 'trend');
  const trendOptions = select(
    'Trend option',
    {
      None: 'none',
      Icon: 'icon',
      Value: 'value',
      Both: 'both',
    },
    'both',
  );
  const breakpointShow = select(
    'Show breakpoints',
    {
      Small: 'small',
      Big: 'big',
    },
    'small',
  );
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
  const trendShape = customKnobs.fromEnum('trend shape', MetricTrendShape, MetricTrendShape.Area);

  const progressMax = 100;
  const value = text('value', '55.23');
  const valuePrefix = '';
  const valuePostfix = ' %';
  const metricColor = color('color', '#3c3c3c');
  const useValueColor = boolean('use value color', false);
  const valueColor = color('value color', '#3c3c3c');
  const showIcon = boolean('show icon', false);
  const iconType = 'warning';
  const useBlendingBackground = boolean('use blending background', false);
  const blendingBackground = color('blending background', 'rgba(255,255,255,1)');
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
  const titlesTextAlign = 'left';
  const valueTextAlign = 'right';
  const extraTextAlign = 'right';
  const iconAlign = 'right';
  const getIcon =
    (type: string) =>
    ({ width, height, color }: { width: number; height: number; color: string }) => (
      <EuiIcon type={type} width={width} height={height} fill={color} style={{ width, height }} />
    );

  const data = {
    color: metricColor,
    title,
    valueColor: useValueColor ? valueColor : undefined,
    subtitle,
    extra: ({ fontSize, color }: { fontSize: number; color: string }) => (
      <>
        {extraText}{' '}
        {trendOptions === 'none' ? (
          '99.99%'
        ) : (
          <EuiBadge
            color="success"
            style={{ fontSize, lineHeight: `${fontSize}px`, border: `1px solid ${color}` }}
            iconType={
              ['both', 'icon'].includes(trendOptions)
                ? () => <EuiIcon type="sortUp" style={{ inlineSize: fontSize, blockSize: fontSize }} />
                : undefined
            }
          >
            {trendOptions !== 'icon' ? '99.99%' : ''}
          </EuiBadge>
        )}
      </>
    ),
    ...(showIcon ? { icon: getIcon(iconType) } : {}),
  };

  const numericData: MetricWProgress | MetricWNumber | MetricWTrend = {
    ...data,
    value: Number.parseFloat(value),
    valueFormatter: (d: number) => `${valuePrefix}${d}${valuePostfix}`,
    ...(progressOrTrend === 'bar' ? { domainMax: progressMax, progressBarDirection } : {}),
    ...(progressOrTrend === 'trend'
      ? {
          trend: KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, 30).map(([x, y]) => ({ x, y })),
          trendShape,
        }
      : {}),
  };

  const onEventClickAction = action('click');
  const onEventOverAction = action('over');
  const onEventOutAction = action('out');

  const configuredData = [[numericData]];
  const baseTheme = useBaseTheme();
  const breakpoints = breakpointShow === 'small' ? ['200px', '300px', '400px'] : ['500px', '600px', '700px'];
  return (
    <>
      <EuiFlexGroup>
        {breakpoints.map((height, i) => (
          <EuiFlexItem
            key={height}
            style={{
              height,
              width: '200px',
            }}
          >
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
    </>
  );
};

Example.parameters = {
  resize: {
    height: '700px',
    width: '1200px',
  },
};
