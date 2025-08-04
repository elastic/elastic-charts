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

import type {
  MetricWProgress,
  MetricWTrend,
  MetricWText,
  MetricWNumber,
  MetricTextAlign,
  SecondaryMetricProps,
} from '@elastic/charts';
import { Chart, isMetricElementEvent, Metric, MetricTrendShape, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const getTextAlignKnob = (name: string, defaultValue: MetricTextAlign, groupId?: string): MetricTextAlign =>
  select(name, { Left: 'left', Center: 'center', Right: 'right' }, defaultValue, groupId);

const getIcon =
  (type: string) =>
  ({ width, height, color }: { width: number; height: number; color: string }) => (
    <EuiIcon type={type} width={width} height={height} fill={color} style={{ width, height }} />
  );

const textConfigurationAndPositionGroup = 'Text configuration and position';
const secondaryMetricGroup = 'Secondary metric';
const colorGroup = 'Colors';

export const Example: ChartsStory = (_, { title: storyTitle, description }) => {
  // Title and subtitle values
  const title = text('Title', 'Count of records');
  const subtitle = text('Subtitle', 'Little description of this component');

  // Visualization type
  const progressOrTrend = select('Visualization type', { trend: 'trend', bar: 'bar', none: 'none' }, 'bar');
  const progressBarDirection = select(
    'Progress bar direction',
    { horizontal: 'horizontal', vertical: 'vertical' },
    'vertical',
  );

  const maxDataPoints = number('Trend data points', 30, { min: 0, max: 50, step: 1 });
  const trendShape = customKnobs.fromEnum('Trend shape', MetricTrendShape, MetricTrendShape.Area);
  const trendA11yTitle = text('Trend a11y title', 'The Cluster CPU Usage trend');
  const trendA11yDescription = text(
    'Trend a11y description',
    'The trend shows a peak of CPU usage in the last 5 minutes',
  );

  const progressMax = number('Progress max', 100);
  const numberTextSwitch = boolean('Is numeric metric', true);
  const value = text('Value', '55.23');
  const valuePrefix = text('Value prefix', '');
  const valuePostfix = text('Value postfix', ' %');

  // Secondary metric

  const showExtra = boolean('Show extra', true, secondaryMetricGroup);
  const useCustomExtra = boolean('Use custom extra', false, secondaryMetricGroup);

  let extra = text('Custom extra', 'last <b>5m</b>', secondaryMetricGroup);
  extra = extra.replace('&lt;b&gt;', '<b>');
  extra = extra.replace('&lt;/b&gt;', '</b>');

  const secondaryMetricValue = text('Secondary metric value', '87.20', secondaryMetricGroup);
  const secondaryMetricIcon = select(
    'Secondary metric trend icon',
    { Increase: '↑', Decrease: '↓', Stable: '=', Empty: '' },
    '↑',
    secondaryMetricGroup,
  );
  const secondaryMetricIconSide = select(
    'Secondary metric trend icon side',
    { Right: 'right', Left: 'left' },
    'right',
    secondaryMetricGroup,
  );
  const label = text('Label', 'Last week', secondaryMetricGroup);
  const colorByValue = boolean('Color by value', true, secondaryMetricGroup);
  const badgeColor = color('Secondary metric value color', 'rgb(93, 191, 149)', secondaryMetricGroup);
  const secondaryMetricValuePosition = select(
    'Secondary metric value position',
    { before: 'before', after: 'after' },
    'after',
    secondaryMetricGroup,
  );
  const secondaryMetricAriaDescription = text('Aria description', 'This is a description', secondaryMetricGroup);

  const secondaryProps: SecondaryMetricProps = {
    value: secondaryMetricValue,
    label,
    badgeColor: colorByValue ? badgeColor : undefined,
    valuePosition: secondaryMetricValuePosition,
    ariaDescription: secondaryMetricAriaDescription,
    icon: secondaryMetricIcon,
    iconSide: secondaryMetricIconSide,
  };

  const dataExtra = showExtra
    ? useCustomExtra
      ? { extra: <span dangerouslySetInnerHTML={{ __html: extra }}></span> }
      : { extra: secondaryProps }
    : {};

  // Colors

  const metricColor = color('Metric color', 'rgb(246,	217,	143)', colorGroup);

  const useValueColor = boolean('Use value color', false, colorGroup);
  const valueColor = select(
    'Value color',
    {
      euiColorVisText0: '#065B58',
      euiColorVisText1: '#047471',
      euiColorVisText2: '#154399',
      euiColorVisText3: '#0B64DD',
      euiColorVisText4: '#A11262',
      euiColorVisText5: '#D13680',
      euiColorVisText6: '#A71627',
      euiColorVisText7: '#DA3737',
      euiColorVisText8: '#6A4906',
      euiColorVisText9: '#966B03',
    },
    '#065B58',
    colorGroup,
  );
  const useBlendingBackground = boolean('Use blending background', false, colorGroup);
  const blendingBackground = color('Blending background', 'rgba(255,255,255,1)', colorGroup);
  const barBackground = color('Bar background', 'rgb(194,	201,	214)	', colorGroup);

  // Metric icon
  const iconType = 'warning';
  const showIcon = boolean('Show metric icon', false, textConfigurationAndPositionGroup);
  const iconAlign = select(
    'Metric icon align',
    { Left: 'left', Right: 'right' },
    'right',
    textConfigurationAndPositionGroup,
  );

  // Value icon
  const showValueIcon = boolean('Show value icon', false);
  const valueIconType = 'sortUp';

  const data = {
    color: metricColor,
    title,
    valueColor: useValueColor ? valueColor : undefined,
    subtitle,
    ...dataExtra,
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

  // Title and subtitle
  const titlesTextAlign = getTextAlignKnob('Title and subtitle alignment', 'left', textConfigurationAndPositionGroup);
  const titleWeight = select(
    'Title weight',
    { Bold: 'bold', Normal: 'normal' },
    'normal',
    textConfigurationAndPositionGroup,
  );
  // Value (primary metric)
  const valuePosition = select(
    'Primary metric position',
    { Bottom: 'bottom', Top: 'top' },
    'top',
    textConfigurationAndPositionGroup,
  );
  const valueTextAlign = getTextAlignKnob('Primary metric alignment', 'left', textConfigurationAndPositionGroup);
  const valueFontSizeMode = select(
    'Primary metric font size mode',
    { Default: 'default', Fit: 'fit', Custom: 'custom' },
    'default',
    textConfigurationAndPositionGroup,
  );
  const valueFontSize = number(
    'Primary metric font size (only if custom font size selected)',
    40,
    { min: 0, step: 10 },
    textConfigurationAndPositionGroup,
  );
  // Extra (secondary metric)
  const extraTextAlign = getTextAlignKnob('Extra element alignment', 'left', textConfigurationAndPositionGroup);

  const baseTheme = useBaseTheme();

  return (
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
            barBackground,
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
      <Metric id="metric-id" data={configuredData} />
    </Chart>
  );
};

Example.parameters = {
  resize: {
    height: '200px',
    width: '200px',
  },
};
