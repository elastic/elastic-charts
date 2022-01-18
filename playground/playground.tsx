/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart } from '../packages/charts/src/components/chart';
import { ScaleType } from '../packages/charts/src/scales/constants';
import { AreaSeries, Settings } from '../packages/charts/src/specs';
// import { Position } from '../packages/charts/src/utils/common';
import { KIBANA_METRICS } from '../packages/charts/src/utils/data_samples/test_dataset_kibana';
import { useBaseTheme } from '../storybook/use_base_theme';

export function Playground() {
  const baseTheme = useBaseTheme();
  const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];

  return (
    <Chart>
      <Settings baseTheme={baseTheme} debug />
      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
  // <Chart>
  //   <Settings showLegend showLegendExtra legendPosition={Position.Right} baseTheme={useBaseTheme()} debug />
  //   <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
  //   <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
  //   <BarSeries
  //     id="bars"
  //     xScaleType={ScaleType.Linear}
  //     yScaleType={ScaleType.Linear}
  //     xAccessor="x"
  //     yAccessors={['y']}
  //     data={[
  //       { x: 0, y: 2 },
  //       { x: 1, y: 7 },
  //       { x: 2, y: 3 },
  //       { x: 3, y: 6 },
  //     ]}
  //   />
  //   <LineSeries
  //     id="line"
  //     xScaleType={ScaleType.Linear}
  //     yScaleType={ScaleType.Linear}
  //     xAccessor="x"
  //     yAccessors={['y']}
  //     data={[
  //       { x: 0, y: 3 },
  //       { x: 1, y: 2 },
  //       { x: 2, y: 4 },
  //       { x: 3, y: 10 },
  //     ]}
  //   />
  // </Chart>
}
