/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { AreaSeries, Axis, Chart, CurveType, Position, ScaleType, Settings } from '@elastic/charts';
import { clamp } from '@elastic/charts/src/utils/common';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const start = KIBANA_METRICS.metrics.kibana_os_load.v1.data[0]![0];
  const data = KIBANA_METRICS.metrics.kibana_os_load.v1.data
    .slice(0, 21)
    .map((d) => [(d[0]! - start!) / 30000, clamp(d[1]!, 0, 30)]);
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} ticks={3} tickFormat={(d) => `${d} sec`} />
      <Axis
        id="left"
        position={Position.Left}
        labelFormat={(d) => `${d.toFixed(0)}%`}
        tickFormat={(d) => `${d.toFixed(1)}%`}
        ticks={5}
      />

      <AreaSeries
        id={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        yNice
        xAccessor={0}
        yAccessors={[1]}
        data={data}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};
