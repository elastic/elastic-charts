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

import type { MetricWProgress, MetricWTrend, MetricWText, MetricWNumber, SecondaryMetricProps } from '@elastic/charts';
import { Chart, isMetricElementEvent, Metric, MetricTrendShape, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import {
  defaultProgressValueLabels,
  getProgressBarFill,
  labelsGroup,
  metricGroup,
  progressBarPaletteOptions,
  progressBarGroup,
  progressBarSizeOptions,
  trendGroup,
} from './progress_bar_story_helpers';
import type { ChartsStory } from '../../types';
import { useBaseTheme, useThemeId } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const getTextAlignKnob = (
  name: string,
  defaultValue: 'left' | 'center' | 'right',
  groupId?: string,
): 'left' | 'center' | 'right' =>
  select(name, { Left: 'left', Center: 'center', Right: 'right' }, defaultValue, groupId);

const getIcon =
  (type: string) =>
  ({ width, height, color }: { width: number; height: number; color: string }) => (
    <EuiIcon type={type} width={width} height={height} fill={color} style={{ width, height }} />
  );

// Secondary metric and badge controls live in the same Storybook group as the
// primary metric styling so all value-related options stay together.
const secondaryMetricGroup = metricGroup;

const badgeColorMap = {
  // Trend palette
  compareTo1: { background: '#FDDDD8', text: '#A71627' },
  compareTo2: { background: '#E3E8F2', text: '#1D2A3E' },
  compareTo3: { background: '#C9F3E3', text: '#09724D' },

  // COMPLEMENTARY palette
  complementary1: { background: '#D9E8FF', text: '#1750BA' },
  complementary2: { background: '#E3E8F2', text: '#1D2A3E' },
  complementary3: { background: '#FDE9B5', text: '#825803' },
} as const;

type BadgeColorKey = keyof typeof badgeColorMap;

export const Example: ChartsStory = (_, { title: storyTitle, description }) => {
  const baseTheme = useBaseTheme();
  const isDarkTheme = useThemeId().includes('dark');

  const title = text('Title', 'Count of records', labelsGroup);
  const titleWeight = select('Title weight', { Bold: 'bold', Medium: 500, Normal: 'normal' }, 500, labelsGroup);
  const subtitle = text('Subtitle', 'Little description of this component', labelsGroup);
  const titlesTextAlign = getTextAlignKnob('Title and subtitle alignment', 'left', labelsGroup);
  const valuePrefix = text('Value prefix', '', labelsGroup);
  const valuePostfix = text('Value postfix', ' %', labelsGroup);
  const showValueIcon = boolean('Show value icon', false, labelsGroup);
  const showIcon = boolean('Show metric icon', false, labelsGroup);
  const iconAlign = select('Metric icon align', { Left: 'left', Right: 'right' }, 'right', labelsGroup);
  const valuePosition = select(
    'Primary metric position',
    { Bottom: 'bottom', Middle: 'middle', Top: 'top' },
    'top',
    labelsGroup,
  );
  const valueTextAlign = getTextAlignKnob('Primary metric alignment', 'left', labelsGroup);
  const valueFontSizeMode = select(
    'Primary metric font size mode',
    { Default: 'default', Fit: 'fit', Custom: 'custom' },
    'default',
    labelsGroup,
  );
  const valueFontSize = number(
    'Primary metric font size (only if custom font size selected)',
    40,
    { min: 0, step: 10 },
    labelsGroup,
  );
  const extraTextAlign = getTextAlignKnob('Extra element alignment', 'left', labelsGroup);

  const value = text('Value', '55.23', metricGroup);
  const numberTextSwitch = boolean('Is numeric metric', true, metricGroup);
  const metricColor = color('Metric color', 'rgb(246,	217,	143)', metricGroup);
  const useValueColor = boolean('Use value color', false, metricGroup);
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
    metricGroup,
  );
  const useBlendingBackground = boolean('Use blending background', false, metricGroup);
  const blendingBackground = color('Blending background', 'rgba(255,255,255,1)', metricGroup);

  const progressOrTrend = select(
    'Visualization type',
    { Trend: 'trend', 'Progress bar': 'bar', None: 'none' },
    'bar',
    progressBarGroup,
  );
  const progressBarDirection = select(
    'Progress bar direction',
    { horizontal: 'horizontal', vertical: 'vertical' },
    'vertical',
    progressBarGroup,
  );
  const progressBarSize = select('Progress bar size', progressBarSizeOptions, 'auto', progressBarGroup);
  const progressMin = number('Progress min', 0, { range: true, min: -200, max: 200, step: 1 }, progressBarGroup);
  const progressMax = number('Progress max', 100, { range: true, min: -200, max: 200, step: 1 }, progressBarGroup);
  const progressBarPalette = select('Progress bar palette', progressBarPaletteOptions, 'none', progressBarGroup);
  const barBackground = color('Bar background', 'rgb(194,	201,	214)	', progressBarGroup);

  const maxDataPoints = number('Trend data points', 30, { min: 0, max: 50, step: 1 }, trendGroup);
  const trendShape = customKnobs.fromEnum('Trend shape', MetricTrendShape, MetricTrendShape.Area, {
    group: trendGroup,
  });
  const trendA11yTitle = text('Trend a11y title', 'The Cluster CPU Usage trend', trendGroup);
  const trendA11yDescription = text(
    'Trend a11y description',
    'The trend shows a peak of CPU usage in the last 5 minutes',
    trendGroup,
  );

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
  const secondaryMetricIconPosition = select(
    'Secondary metric trend icon position',
    { Before: 'before', After: 'after' },
    'after',
    secondaryMetricGroup,
  );
  const label = text('Label', 'Last week', secondaryMetricGroup);
  const colorByValue = boolean('Color by value', true, secondaryMetricGroup);
  const dynamicBadgeColor = boolean('Dynamic badge color', true, secondaryMetricGroup);
  const badgeColor = dynamicBadgeColor
    ? (() => {
        const selectedBadgeColor = select(
          'Secondary metric value color',
          {
            compareTo1: 'compareTo1',
            compareTo2: 'compareTo2',
            compareTo3: 'compareTo3',
            complementary1: 'complementary1',
            complementary2: 'complementary2',
            complementary3: 'complementary3',
          } satisfies Record<BadgeColorKey, BadgeColorKey>,
          'compareTo3',
          secondaryMetricGroup,
        ) as string;

        return (
          badgeColorMap[selectedBadgeColor as BadgeColorKey] ?? { background: selectedBadgeColor, text: undefined }
        );
      })()
    : { background: color('Secondary metric value color', '#24C292', secondaryMetricGroup), text: undefined };

  const secondaryMetricLabelPosition = select(
    'Secondary metric label position',
    { before: 'before', after: 'after' },
    'before',
    secondaryMetricGroup,
  );
  const secondaryMetricAriaDescription = text('Aria description', 'This is a description', secondaryMetricGroup);
  const useBadgeTextColor = boolean('Custom badge text color', true, secondaryMetricGroup);
  const badgeBorder = boolean('Badge border', true, secondaryMetricGroup);
  const badgeBorderSelection = select(
    'Badge border color',
    {
      default: 'auto',
      customColor: 'custom color',
    },
    'auto',
    secondaryMetricGroup,
  );
  const badgeBorderColor = color('Badge border color selector', '#BFDBFF', secondaryMetricGroup);
  const secondaryBadgeBorderColor: SecondaryMetricProps['badgeBorderColor'] = badgeBorder
    ? badgeBorderSelection === 'auto'
      ? { mode: 'auto' }
      : { mode: 'custom', color: badgeBorderColor }
    : { mode: 'none' };

  const secondaryProps: SecondaryMetricProps = {
    value: secondaryMetricValue,
    label,
    badgeColor: colorByValue ? badgeColor.background : undefined,
    badgeTextColor: useBadgeTextColor ? badgeColor.text : undefined,
    labelPosition: secondaryMetricLabelPosition,
    ariaDescription: secondaryMetricAriaDescription,
    icon: secondaryMetricIcon,
    iconPosition: secondaryMetricIconPosition,
    badgeBorderColor: secondaryBadgeBorderColor,
  };

  const dataExtra = showExtra
    ? useCustomExtra
      ? { extra: <span dangerouslySetInnerHTML={{ __html: extra }}></span> }
      : { extra: secondaryProps }
    : {};

  // Metric icon
  const iconType = 'warning';
  const valueIconType = 'sortUp';

  const progressDomain: [number, number] = [progressMin, progressMax];
  const progressBarFill = getProgressBarFill(progressBarPalette, progressDomain, isDarkTheme);
  const progressBarSizeOverride = progressBarSize === 'auto' ? undefined : progressBarSize;

  const data = {
    color: metricColor,
    title,
    valueColor: useValueColor ? valueColor : undefined,
    subtitle,
    ...dataExtra,
    ...(showIcon ? { icon: getIcon(iconType) } : {}),
    ...(showValueIcon ? { valueIcon: getIcon(valueIconType) } : {}),
  };

  const numericDataBase = {
    ...data,
    value: Number.parseFloat(value),
    valueFormatter: (d: number) => `${valuePrefix}${d}${valuePostfix}`,
  };
  const trendData = {
    trend: KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, maxDataPoints).map(([x, y]) => ({ x, y })),
    trendShape,
    trendA11yTitle,
    trendA11yDescription,
  };
  // A non-zero minimum exercises the public explicit-domain Metric progress API,
  // which Lens also needs for signed ranges.
  const numericProgressData: MetricWProgress = {
    ...numericDataBase,
    domainMax: progressMax,
    domainMin: progressMin !== 0 ? progressMin : undefined,
    progressBarDirection,
    progressBarFill,
    progressBarSize: progressBarSizeOverride,
    progressValueLabels: progressMin !== 0 ? defaultProgressValueLabels : undefined,
  };
  const numericData: MetricWProgress | MetricWNumber | MetricWTrend =
    progressOrTrend === 'bar'
      ? numericProgressData
      : progressOrTrend === 'trend'
        ? { ...numericDataBase, ...trendData }
        : numericDataBase;

  const textualData: MetricWText | MetricWTrend = {
    ...data,
    value,
    ...(progressOrTrend === 'trend' ? trendData : {}),
  };

  const onEventClickAction = action('click');
  const onEventOverAction = action('over');
  const onEventOutAction = action('out');

  // Progress bars require numeric values, so keep the numeric Metric path when
  // the progress-bar visualization is selected.
  const configuredData = [[progressOrTrend === 'bar' || numberTextSwitch ? numericData : textualData]];

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
