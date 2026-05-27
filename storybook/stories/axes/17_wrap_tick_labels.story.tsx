/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const data = [
  { category: 'a very long category name', value: 10 },
  { category: 'a very very very very very long category name', value: 20 },
  { category: 'label', value: 30 },
  { category: 'medium label', value: 40 },
];

export const Example: ChartsStory = (_, { title, description }) => {
  const lineHeight = number('lineHeight', 1.2, { min: 0, max: 2, step: 0.1 });
  const wrapLines = number('wrapLines', 2, { min: 1, max: 10, step: 1 });
  const rotation = number('rotation', 0, { min: 0, max: 90, step: 10 });
  const alignmentHorizontal = customKnobs.enum.horizontalTextAlignment('Alignment Horizontal', 'near');
  const alignmentVertical = customKnobs.enum.verticalTextAlignment('Alignment Vertical', 'near');

  return (
    <Chart title={title} description={description}>
      <Settings debug={boolean('debug', true)} baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        position={Position.Top}
        title="Top axis"
        showOverlappingTicks={boolean('showOverlappingTicks', true)}
        style={{
          tickLabel: {
            lineHeight,
            wrapLines,
            rotation,
            alignment: {
              horizontal: alignmentHorizontal,
              vertical: alignmentVertical,
            },
          },
        }}
      />
      <Axis
        id="left2"
        title="Left axis"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        style={{
          maxSize: {
            left: 5,
          },
          tickLabel: {
            alignment: {
              horizontal: 'right',
              vertical: 'middle',
            },
          },
        }}
      />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="category"
        yAccessors={['value']}
        data={data}
      />
    </Chart>
  );
};
