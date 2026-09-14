/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiToolTip } from '@elastic/eui';
import { select, text } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import type { MetricWTrend, SecondaryMetricLabelTooltipProps } from '@elastic/charts';
import { Chart, Metric, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const EuiLabelTooltip = ({ children, label, placement }: SecondaryMetricLabelTooltipProps) => (
  <EuiToolTip content={label} position={placement}>
    {children}
  </EuiToolTip>
);

const SimpleLabelTooltip = ({ children, label, value, placement }: SecondaryMetricLabelTooltipProps) => {
  const [visible, setVisible] = useState(false);

  const positionStyle: React.CSSProperties =
    placement === 'left'
      ? { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 4 }
      : placement === 'right'
        ? { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 4 }
        : { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 4 };

  return (
    <span
      style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}
      onPointerEnter={() => setVisible(true)}
      onPointerLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          style={{
            position: 'absolute',
            ...positionStyle,
            backgroundColor: 'red',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            whiteSpace: 'nowrap',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {label}: {value}
        </span>
      )}
    </span>
  );
};

export const Example: ChartsStory = (_, { title: storyTitle, description }) => {
  const tooltipVariant = select(
    'label tooltip variant',
    {
      'Default (built-in)': 'default',
      EuiToolTip: 'eui',
      'Simple custom': 'custom',
    },
    'eui',
  );
  const extraTextAlign = select(
    'extra text-align (drives placement)',
    { Left: 'left', Center: 'center', Right: 'right' },
    'right',
  );
  const label = text('secondary metric label', 'Difference');

  const labelTooltip =
    tooltipVariant === 'eui' ? EuiLabelTooltip : tooltipVariant === 'custom' ? SimpleLabelTooltip : undefined;

  const data: MetricWTrend = {
    color: '#3c3c3c',
    title: 'Cluster CPU usage',
    subtitle: 'Last 10 minutes',
    value: 55.23,
    valueFormatter: (d: number) => `${d} %`,
    trend: KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, 30).map(([x, y]) => ({ x, y })),
    trendShape: 'area',
    extra: {
      value: '5.3%',
      label,
      labelPosition: 'tooltip',
      badgeColor: '#a6edea',
      labelTooltip,
    },
  };

  return (
    <Chart title={storyTitle} description={description}>
      <Settings
        theme={{
          metric: {
            extraTextAlign,
          },
        }}
        baseTheme={useBaseTheme()}
      />
      <Metric id="label-tooltip" data={[[data]]} />
    </Chart>
  );
};

Example.parameters = {
  resize: {
    height: '300px',
    width: '300px',
  },
};
