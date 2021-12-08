/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { Axis, Chart, Position, ScaleType, Settings, StackMode } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { data } from '../utils/datasets/product_profits';
import { getXYSeriesKnob } from '../utils/knobs';

export const Example = () => {
  const stacked = boolean('stacked', true);
  const polarity = select('data polarity', ['Mixed', 'Positive', 'Negative'], 'Positive');
  const customDomain = boolean('custom domain', false);
  const stackMode =
    select<StackMode | undefined>(
      'stackMode',
      {
        None: undefined,
        Silhouette: StackMode.Silhouette,
        Wiggle: StackMode.Wiggle,
        Percentage: StackMode.Percentage,
      },
      StackMode.Wiggle,
    ) ?? undefined;
  const [SeriesType] = getXYSeriesKnob();
  return (
    <Chart>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} title="Products" />
      <Axis
        id="left"
        title="Profit"
        position={Position.Left}
        domain={customDomain ? { min: -25000, max: 50000 } : undefined}
        tickFormat={(d) => numeral(d).format(stackMode === 'percentage' ? '0%' : '$0,0')}
      />

      <SeriesType
        id="series"
        color={['#7BC0F7', '#3C8AD8', '#F18026', '#FEDB69']}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="product"
        yAccessors={[
          ({ profit }) => (polarity === 'Mixed' ? profit : (polarity === 'Negative' ? -1 : 1) * Math.abs(profit)),
        ]}
        splitSeriesAccessors={['state']}
        stackMode={stackMode}
        stackAccessors={stacked ? ['yes'] : undefined}
        data={data}
      />
    </Chart>
  );
};
