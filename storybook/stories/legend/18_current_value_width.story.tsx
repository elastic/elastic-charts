/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, LegendValue, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const examples = {
  decimals: { values: [3.5, 7.25, 12], formatter: (value: number) => String(value) },
  bytes: {
    values: [500, 1024, 50],
    formatter: (value: number) => (value >= 1024 ? `${value / 1024} KB` : `${value} Bytes`),
  },
  negative: { values: [-2000.25, 12, 0], formatter: (value: number) => String(value) },
};

export const Example: ChartsStory = (_, { title, description }) => {
  const example = select('Formatter', { Decimals: 'decimals', Bytes: 'bytes', Negative: 'negative' }, 'decimals');
  const { values, formatter } = examples[example];
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendLayout="list"
        legendPosition={Position.Bottom}
        legendValues={[LegendValue.CurrentAndLastValue]}
        baseTheme={useBaseTheme()}
      />
      <Axis id="x" position={Position.Bottom} />
      <Axis id="y" position={Position.Left} tickFormat={formatter} />
      <BarSeries
        id="values"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={values.map((y, x) => ({ x, y }))}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Hover each bar to compare formatted values. The current value column reserves enough width for decimals, negative values, and adaptive units without shifting the legend.',
};
