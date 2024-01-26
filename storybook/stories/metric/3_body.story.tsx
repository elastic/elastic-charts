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
import classNames from 'classnames';
import React from 'react';

import {
  Chart,
  isMetricElementEvent,
  Metric,
  MetricWProgress,
  MetricWTrend,
  MetricWNumber,
  Settings,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

import './3_slot.scss';

export const Example: ChartsStory = (_, { title: storyTitle, description }) => {
  const title = text('title', 'SLO: Frontend Latency');
  const subtitle = text('subtitle', '');
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

  let extra = text('extra', 'Target <b>99.00%</b>');
  const progressMax = number('progress max', 100);
  const value = text('value', '99.45');
  const valuePostfix = text('value postfix', ' %');
  const metricColor = color('color', '#3c3c3c');
  extra = extra.replace('&lt;b&gt;', '<b>');
  extra = extra.replace('&lt;/b&gt;', '</b>');
  const showIcon = boolean('show icon', true);
  const iconType = customKnobs.eui.getIconTypeKnob('EUI icon glyph name', 'visGauge');
  const showValueIcon = boolean('show value icon', false);
  const valueIconType = customKnobs.eui.getIconTypeKnob('EUI value icon glyph name', 'sortUp');
  const showBody = boolean('show body contents', true);
  const showBodyArea = boolean('show full body area', false);
  const getIcon =
    (type: string) =>
    ({ width, height, color }: { width: number; height: number; color: string }) => (
      <EuiIcon type={type} width={width} height={height} fill={color} style={{ width, height }} />
    );
  const data = {
    color: metricColor,
    title,
    subtitle,
    extra: <span dangerouslySetInnerHTML={{ __html: extra }}></span>,
    ...(showIcon ? { icon: getIcon(iconType) } : {}),
    ...(showValueIcon ? { valueIcon: getIcon(valueIconType) } : {}),
  };

  const numericData: MetricWProgress | MetricWNumber | MetricWTrend = {
    ...data,
    value: Number.parseFloat(value),
    valueFormatter: (d: number) => `${d}${valuePostfix}`,
    ...(progressOrTrend === 'bar' ? { domainMax: progressMax, progressBarDirection } : {}),
    ...(progressOrTrend === 'trend'
      ? {
          trend: KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, 40).map(([x, y]) => ({ x, y })),
        }
      : {}),
  };

  const onEventClickAction = action('click');
  const onEventOverAction = action('over');
  const onEventOutAction = action('out');

  const configuredData = [[numericData]];
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
      <Metric
        id="1"
        data={configuredData}
        body={
          !showBody ? null : (
            <div className={classNames('myCustomMetricSlot', { showBodyArea })} style={{ paddingTop: 8 }}>
              <div>
                <EuiFlexGroup wrap responsive={false} gutterSize="s">
                  <EuiFlexItem grow={false}>
                    <EuiBadge color="success">Healthy</EuiBadge>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiBadge color="danger" iconType="warning" iconSide="left">
                      13
                    </EuiBadge>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </div>
          )
        }
      />
    </Chart>
  );
};

Example.parameters = {
  resize: {
    height: '300px',
    width: '300px',
  },
  markdown: `Warning: :warning: This feature should be used with care. The body content does not take up space in order to preserve the rendering of elements of the Metric.`,
};
