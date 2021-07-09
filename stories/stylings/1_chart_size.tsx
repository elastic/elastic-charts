/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { BarSeries, Chart, ScaleType, Settings, RecursivePartial, Theme } from '../../packages/charts/src';
import { SeededDataGenerator } from '../../packages/charts/src/mocks/utils';
import { TooltipType } from '../../packages/charts/src/specs/constants';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const dg = new SeededDataGenerator();
const data2 = dg.generateSimpleSeries(40);

export const Example = () => {
  const theme: RecursivePartial<Theme> = {
    chartMargins: {
      bottom: 0,
      left: 0,
      top: 0,
      right: 0,
    },
  };
  return (
    <div>
      <Chart className="story-chart" size={{ width: 100, height: 50 }}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart className="story-chart" size={{ height: 50 }}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart className="story-chart" size={['50%', 50]}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart className="story-chart" size={[undefined, 50]}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart className="story-chart" size={50}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
    </div>
  );
};

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
