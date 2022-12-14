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
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');

export const Example = () => (
  <Chart>
    <Settings
      showLegend
      showLegendExtra
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
      timeAxisLayerCount={2}
      showGridLines
      style={{
        tickLine: { size: 0.0001, padding: 4 },
        tickLabel: {
          alignment: { horizontal: Position.Left, vertical: Position.Bottom },
          padding: 0,
          offset: { x: 0, y: 0 },
        },
      }}
    />
    <Tooltip customTooltip={() => null} style={{ border: 'none' }} />
    <Axis
      id="left"
      position={Position.Left}
      showGridLines
      tickFormat={(d) => Number(d).toFixed(2)}
      labelFormat={(d) => Number(d).toFixed(0)}
      ticks={5}
    />
    <LineSeries
      id="1"
      name={KIBANA_METRICS.metrics.kibana_os_load[2].metric.label}
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      yNice
      data={KIBANA_METRICS.metrics.kibana_os_load[2].data}
      lineSeriesStyle={{
        point: {
          visible: false,
        },
      }}
    />
    <LineSeries
      id="2"
      name={KIBANA_METRICS.metrics.kibana_os_load[1].metric.label}
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      yNice
      data={KIBANA_METRICS.metrics.kibana_os_load[1].data}
      lineSeriesStyle={{
        point: {
          visible: false,
        },
      }}
    />
    <LineSeries
      id="3"
      name={KIBANA_METRICS.metrics.kibana_os_load[0].metric.label}
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      stackAccessors={[0]}
      yNice
      data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
      lineSeriesStyle={{
        point: {
          visible: false,
        },
      }}
    />
  </Chart>
);
