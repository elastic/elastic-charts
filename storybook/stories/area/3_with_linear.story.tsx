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
  const start = KIBANA_METRICS.metrics.kibana_os_load[0].data[0][0];
  const data = KIBANA_METRICS.metrics.kibana_os_load[0].data
    .slice(0, 20)
    .map((d) => [(d[0] - start) / 30000, clamp(d[1] - 10, 0, 3)]);
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" title="index" position={Position.Bottom} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Math.round(Number(d))}`}
        ticks={7}
      />

      <AreaSeries
        id="areas"
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
