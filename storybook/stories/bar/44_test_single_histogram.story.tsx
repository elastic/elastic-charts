/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  Axis,
  Chart,
  HistogramBarSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

// for testing purposes only
export const Example = () => {
  const formatter = timeFormatter(niceTimeFormatByDay(1));

  const xDomain = {
    minInterval: 60000,
  };

  return (
    <Chart>
      <Settings xDomain={xDomain} baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks
        tickFormat={formatter}
      />
      <Axis id="left" title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title} position={Position.Left} />
      <HistogramBarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 1)}
      />
    </Chart>
  );
};
