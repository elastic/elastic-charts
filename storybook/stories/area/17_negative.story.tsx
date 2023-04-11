/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, timeFormatter } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const dateFormatter = timeFormatter('HH:mm');

const data = KIBANA_METRICS.metrics.kibana_os_load.v1.data.map(([x, y]) => [x, -y]);

export const Example = () => {
  const yScaleType = customKnobs.enum.scaleType('Y scale', ScaleType.Linear, { include: ['Linear', 'Log'] });

  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
      <Axis
        id="left"
        title="negative metric"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={{
          min: NaN,
          max: NaN,
          logMinLimit: number('Y log limit', 1, { min: 0 }),
        }}
      />

      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={yScaleType}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
