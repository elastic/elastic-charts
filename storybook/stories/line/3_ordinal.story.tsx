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
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export const Example = () => (
  <Chart>
    <Settings rotation={customKnobs.enum.rotation()} baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
    <Axis
      id="left"
      title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
      position={Position.Left}
      tickFormat={(d) => `${Number(d).toFixed(2)}%`}
    />
    <LineSeries
      id="lines"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, 5)}
    />
  </Chart>
);
