/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { PartialTheme } from '@elastic/charts';
import { BarSeries, Chart, ScaleType, Settings, Tooltip } from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';
import { TooltipType } from '@elastic/charts/src/specs/constants';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator();
const data2 = dg.generateSimpleSeries(40);

export const Example: ChartsStory = (_, { title, description }) => {
  const theme: PartialTheme = {
    chartMargins: {
      bottom: 0,
      left: 0,
      top: 0,
      right: 0,
    },
  };
  return (
    <div>
      <Chart title={title} description={description} size={{ width: 100, height: 50 }}>
        <Settings theme={theme} baseTheme={useBaseTheme()} />
        <Tooltip type={TooltipType.None} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart title={title} description={description} size={{ height: 50 }}>
        <Settings theme={theme} baseTheme={useBaseTheme()} />
        <Tooltip type={TooltipType.None} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart title={title} description={description} size={['50%', 50]}>
        <Settings theme={theme} baseTheme={useBaseTheme()} />
        <Tooltip type={TooltipType.None} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart title={title} description={description} size={[undefined, 50]}>
        <Settings theme={theme} baseTheme={useBaseTheme()} />
        <Tooltip type={TooltipType.None} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart title={title} description={description} size={50}>
        <Settings theme={theme} baseTheme={useBaseTheme()} />
        <Tooltip type={TooltipType.None} />
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
