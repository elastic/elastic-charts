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
  CurveType,
  LegendValue,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';
import { TSVB_DATASET } from '@elastic/charts/src/utils/data_samples/test_dataset_tsvb';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings
      showLegend
      legendValues={[LegendValue.CurrentAndLastValue]}
      legendPosition={Position.Right}
      baseTheme={useBaseTheme()}
    />
    <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
    <Axis
      id="left"
      title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
      position={Position.Left}
      tickFormat={(d) => `${Number(d).toFixed(0)}%`}
    />
    {TSVB_DATASET.series.map((series) => (
      <LineSeries
        key={series.id}
        id={series.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Log}
        xAccessor={0}
        yAccessors={[1]}
        data={series.data}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    ))}
  </Chart>
);
