/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  LineSeries,
  Axis,
  Chart,
  ColorVariant,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
  Tooltip,
  LegendValue,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings
      showLegend
      legendValues={[LegendValue.CurrentAndLastValue]}
      legendSize={100}
      pointBuffer={Infinity}
      legendPosition={Position.Right}
      baseTheme={useBaseTheme()}
      theme={{
        highlighter: {
          point: {
            radius: 4,
            opacity: 1,
            fill: ColorVariant.Series,
            stroke: ColorVariant.None,
            strokeWidth: 0,
          },
        },
      }}
    />
    <Axis
      id="bottom"
      position={Position.Bottom}
      showOverlappingTicks
      tickFormat={dateFormatter}
      gridLine={{
        visible: true,
      }}
    />
    <Tooltip customTooltip={() => null} />
    <Axis
      id="left"
      position={Position.Left}
      gridLine={{
        visible: true,
      }}
      tickFormat={(d) => Number(d).toFixed(2)}
      labelFormat={(d) => Number(d).toFixed(0)}
      ticks={5}
    />
    <LineSeries
      id="1"
      name={KIBANA_METRICS.metrics.kibana_os_load.v3.metric.label}
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      yNice
      data={KIBANA_METRICS.metrics.kibana_os_load.v3.data}
      lineSeriesStyle={{
        point: {
          visible: 'never',
        },
      }}
    />
    <LineSeries
      id="2"
      name={KIBANA_METRICS.metrics.kibana_os_load.v2.metric.label}
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      yNice
      data={KIBANA_METRICS.metrics.kibana_os_load.v2.data}
      lineSeriesStyle={{
        point: {
          visible: 'never',
        },
      }}
    />
    <LineSeries
      id="3"
      name={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.label}
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      yNice
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
      lineSeriesStyle={{
        point: {
          visible: 'never',
        },
      }}
    />
  </Chart>
);
