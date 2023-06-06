/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, niceTimeFormatter, Position, ScaleType, Settings, StackMode } from '@elastic/charts';
import DATA from '@elastic/charts/src/utils/data_samples/4_time_series.json';

import { useBaseTheme } from '../../use_base_theme';

const dataNames = Object.keys(DATA);
export const Example = () => {
  const stackedAsPercentage = boolean('stacked as percentage', true);
  return (
    <Chart>
      <Settings showLegend legendValue="lastBucket" legendPosition={Position.Right} baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Time"
        tickFormat={niceTimeFormatter([1583100000000, 1583622000000])}
      />
      <Axis
        id="left2"
        title="Left axis"
        position={Position.Left}
        tickFormat={(d) => (stackedAsPercentage ? `${Number(d * 100).toFixed(0)} %` : d.toFixed(0))}
      />
      {Object.values(DATA).map((d, i) => {
        return (
          <AreaSeries
            key={dataNames[i]}
            id={dataNames[i]}
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor="key"
            yAccessors={[
              (datum) => {
                return datum['ffbd09b8-04af-4fcc-ba5f-b0fd50c4862b'].value;
              },
            ]}
            stackMode={stackedAsPercentage ? StackMode.Percentage : undefined}
            stackAccessors={['key']}
            data={d.buckets}
          />
        );
      })}
    </Chart>
  );
};
