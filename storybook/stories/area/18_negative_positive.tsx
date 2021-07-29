/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, timeFormatter } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const dateFormatter = timeFormatter('HH:mm');

export const Example = () => {
  const dataset = KIBANA_METRICS.metrics.kibana_os_load[0];
  const scaleType = select(
    'Y scale',
    {
      [ScaleType.Linear]: ScaleType.Linear,
      [ScaleType.Log]: ScaleType.Log,
    },
    ScaleType.Linear,
  );

  return (
    <Chart>
      <Settings showLegend baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks
        tickFormat={dateFormatter}
      />
      <Axis
        id="left"
        title={dataset.metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={{ logMinLimit: number('Y log limit', 1, { min: 0 }) }}
      />

      <AreaSeries
        id="area1"
        xScaleType={ScaleType.Time}
        yScaleType={scaleType}
        xAccessor={0}
        yAccessors={[1]}
        data={dataset.data.map(([x, y], i) => {
          return [x, i < dataset.data.length / 2 ? -y : y];
        })}
      />
      <AreaSeries
        id="area2"
        xScaleType={ScaleType.Linear}
        yScaleType={scaleType}
        xAccessor={0}
        yAccessors={[1]}
        data={dataset.data.map(([x, y], i) => {
          return [x, i >= dataset.data.length / 2 ? -y : y];
        })}
      />
    </Chart>
  );
};
// storybook configuration
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
