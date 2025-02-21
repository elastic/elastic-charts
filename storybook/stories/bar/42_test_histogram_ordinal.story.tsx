/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import type { PartialTheme } from '@elastic/charts';
import { Axis, BarSeries, Chart, HistogramBarSeries, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

// for testing purposes only
export const Example: ChartsStory = (_, { title, description }) => {
  const data = [
    { x: 'a', y: 2 },
    { x: 'b', y: 7 },
    { x: 'c', y: 0 },
    { x: 'd', y: 6 },
  ];
  const theme: PartialTheme = {
    scales: {
      barsPadding: number('bars padding', 0.25, {
        range: true,
        min: 0,
        max: 1,
        step: 0.1,
      }),
    },
  };

  const hasHistogramBarSeries = boolean('hasHistogramBarSeries', false);
  const stacked = boolean('stacked', true);
  return (
    <Chart title={title} description={description}>
      <Settings
        rotation={customKnobs.enum.rotation()}
        theme={theme}
        baseTheme={useBaseTheme()}
        debug={boolean('debug', true)}
      />
      <Axis id="discover-histogram-left-axis" position={Position.Left} title="left axis" />
      <Axis id="discover-histogram-bottom-axis" position={Position.Bottom} title="bottom axis" />
      {hasHistogramBarSeries && (
        <HistogramBarSeries
          id="histo"
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          stackAccessors={stacked ? ['y'] : []}
          data={data}
          name="histogram"
        />
      )}
      <BarSeries
        id="bars-1"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={stacked ? ['y'] : []}
        data={data}
        name="bars 1"
        enableHistogramMode={boolean('bars-1 enableHistogramMode', false)}
      />
      <BarSeries
        id="bars-2"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={stacked ? ['y'] : []}
        data={data}
        enableHistogramMode={boolean('bars-2 enableHistogramMode', false)}
      />
    </Chart>
  );
};
