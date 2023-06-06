/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, timeFormatter } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');

export const Example = () => (
  <Chart>
    <Settings showLegend legendValue="lastBucket" legendPosition={Position.Right} baseTheme={useBaseTheme()} />
    <Axis
      id="bottom"
      position={Position.Bottom}
      title="timestamp per 1 minute"
      showOverlappingTicks
      tickFormat={dateFormatter}
    />
    <Axis
      id="left"
      title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
      position={Position.Left}
      tickFormat={(d) => Number(d).toFixed(2)}
    />
    <AreaSeries
      id="1"
      name="Count"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v3.data}
    />
    <AreaSeries
      id="2"
      name="Count"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v2.data}
    />
    <AreaSeries
      id="3"
      name="Count"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
    />
  </Chart>
);
