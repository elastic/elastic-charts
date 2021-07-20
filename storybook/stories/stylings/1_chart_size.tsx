/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import { BarSeries, Chart, ScaleType, Settings, PartialTheme } from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';
import { TooltipType } from '@elastic/charts/src/specs/constants';

import { useBaseTheme } from '../../use_base_theme';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const dg = new SeededDataGenerator();
const data2 = dg.generateSimpleSeries(40);

export const Example = () => {
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
      <Chart size={{ width: 100, height: 50 }}>
        <Settings tooltip={TooltipType.None} theme={theme} baseTheme={useBaseTheme()} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart size={{ height: 50 }}>
        <Settings tooltip={TooltipType.None} theme={theme} baseTheme={useBaseTheme()} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart size={['50%', 50]}>
        <Settings tooltip={TooltipType.None} theme={theme} baseTheme={useBaseTheme()} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart size={[undefined, 50]}>
        <Settings tooltip={TooltipType.None} theme={theme} baseTheme={useBaseTheme()} />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart size={50}>
        <Settings tooltip={TooltipType.None} theme={theme} baseTheme={useBaseTheme()} />
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
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
