/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, Position, ScaleType, Settings, BarSeries } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const integersOnly = boolean('Integers values', true);
  const scaleType = customKnobs.enum.scaleType('Scale type', ScaleType.Linear, { include: ['Linear', 'Log', 'Sqrt'] });
  const niceValues = boolean('yNice', false);
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} integersOnly={integersOnly} />

      <BarSeries
        id="Thermal changes"
        xScaleType={ScaleType.Ordinal}
        yScaleType={scaleType}
        xAccessor={0}
        yAccessors={[1]}
        data={[
          ['Sensor 1', 1.2],
          ['Sensor 2', 0.8],
          ['Sensor 3', 0.76],
          ['Sensor 4', 2.12],
          ['Sensor 5', 0.92],
        ]}
        yNice={niceValues}
      />
    </Chart>
  );
};
