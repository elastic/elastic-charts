/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, BarSeries, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const includeString = boolean('include string is x data', true);
  return (
    <Chart title={title} description={description}>
      <Settings xDomain={{ min: 0, max: 10 }} baseTheme={useBaseTheme()} />
      <Axis id="y" title="count" position={Position.Left} />
      <Axis id="x" title={includeString ? 'ordinal fallback scale' : 'linear scale'} position={Position.Bottom} />
      <BarSeries
        id="bars"
        name="amount"
        xScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 1, y: 390, val: 1222 },
          { x: 2, y: 23, val: 1222 },
          { x: includeString ? '3' : 3, y: 750, val: 1222 },
          { x: 4, y: 854, val: 1222 },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Using string values with a `Linear` scale will attempt to fallback to an `Ordinal` scale. Notice how the custom `xDomain` is ignored when the scale falls back to `Ordinal`.',
};
