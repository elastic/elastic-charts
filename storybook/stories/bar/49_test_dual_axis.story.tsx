/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const stack13 = boolean('Stack bars1 and bars3', true);
  const stack24 = boolean('Stack bars2 and bars4', false);
  return (
    <Chart title={title} description={description}>
      <Settings showLegend baseTheme={useBaseTheme()} />
      <Axis id="count1" title="count" position={Position.Left} />
      <Axis id="count2" groupId="2" title="count" position={Position.Right} />
      <Axis id="x" title="goods" position={Position.Bottom} />
      <BarSeries
        id="bars1"
        xScaleType={ScaleType.Ordinal}
        groupId="2"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={stack13 ? ['y'] : undefined}
        data={[
          { x: 'trousers', y: 252 },
          { x: 'watches', y: 499 },
          { x: 'bags', y: 489 },
          { x: 'cocktail dresses', y: 391 },
        ]}
      />

      <BarSeries
        id="bars2"
        xScaleType={ScaleType.Ordinal}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={stack24 ? ['y'] : undefined}
        data={[
          { x: 'trousers', y: 390 },
          { x: 'watches', y: 23 },
          { x: 'bags', y: 750 },
          { x: 'cocktail dresses', y: 853 },
        ]}
      />

      <BarSeries
        id="bars3"
        groupId="2"
        xScaleType={ScaleType.Ordinal}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={stack13 ? ['y'] : undefined}
        data={[
          { x: 'trousers', y: 39 },
          { x: 'watches', y: 2 },
          { x: 'bags', y: 75 },
          { x: 'cocktail dresses', y: 150 },
        ]}
      />

      <BarSeries
        id="bars4"
        xScaleType={ScaleType.Ordinal}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={stack24 ? ['y'] : undefined}
        data={[
          { x: 'trousers', y: 39 },
          { x: 'watches', y: 2 },
          { x: 'bags', y: 75 },
          { x: 'cocktail dresses', y: 150 },
        ]}
      />
    </Chart>
  );
};
