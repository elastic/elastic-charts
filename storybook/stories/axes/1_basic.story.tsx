/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import type { RecursivePartial, AxisStyle } from '@elastic/charts';
import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, niceTimeFormatter } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const customStyle: RecursivePartial<AxisStyle> = {
    tickLabel: {
      padding: number('Tick Label Padding', 0, {
        range: true,
        min: 2,
        max: 30,
        step: 1,
      }),
    },
  };
  const data = KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, 60);
  return (
    <Chart title={title} description={description}>
      <Settings debug={boolean('debug', false)} baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Bottom axis"
        style={customStyle}
        showOverlappingLabels={boolean('Bottom overlap labels', false, 'Bottom Axis')}
        showOverlappingTicks={boolean('Bottom overlap ticks', true, 'Bottom Axis')}
        ticks={number(
          'Number of ticks on bottom',
          10,
          {
            range: true,
            min: 2,
            max: 20,
            step: 1,
          },
          'Bottom Axis',
        )}
        tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
      />
      <Axis
        id="left2"
        title="Left axis"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        style={customStyle}
        showOverlappingLabels={boolean('Left overlap labels', false, 'Left Axis')}
        showOverlappingTicks={boolean('Left overlap ticks', true, 'Left Axis')}
        ticks={number(
          'Number of ticks on left',
          10,
          {
            range: true,
            min: 2,
            max: 20,
            step: 1,
          },
          'Left Axis',
        )}
      />

      <AreaSeries
        id="lines"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
