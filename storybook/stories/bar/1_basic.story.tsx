/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { BarSeries, Chart, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const toggleSpec = boolean('toggle bar spec', true);
  const data1 = [
    { x: 0, y: 2 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 6 },
  ];
  const data2 = data1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'bars1' : 'bars2';
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <BarSeries
        id={specId}
        name="Simple bar series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
