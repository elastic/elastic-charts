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


const dateFormatter = timeFormatter('HH:mm');

export const Example = () => {
  const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];
  const data2 = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d) => [d[0], 20, 10]);

  return (
    <Chart>
      <Settings showLegend showLegendExtra />
      <Axis
        id="bottom"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks
        tickFormat={dateFormatter}
      />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
        stackAccessors={[0]}
      />

      <AreaSeries
        id="fixed band"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        y0Accessors={[2]}
        data={data2}
        stackAccessors={[0]}
      />
    </Chart>
  );
};
