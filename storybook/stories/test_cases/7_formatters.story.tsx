/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { getChartRotationKnob } from '../utils/knobs';

export const Example = () => {
  const rotation = getChartRotationKnob();
  return (
    <Chart>
      <Settings
        baseTheme={useBaseTheme()}
        theme={{ barSeriesStyle: { displayValue: { fill: 'white', fontSize: 12 } } }}
        rotation={rotation}
      />
      <Axis
        id="top"
        position={Position.Top}
        title="Bottom axis"
        tickFormat={(d: any) => `T ${d}`}
        labelFormat={(d: any) => `TL ${d}`}
      />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Bottom axis"
        tickFormat={(d: any) => `B ${d}`}
        labelFormat={(d: any) => `BL ${d}`}
      />
      <Axis
        id="left"
        title="Left axis"
        position={Position.Left}
        tickFormat={(d: any) => `L ${d}`}
        labelFormat={(d: any) => `LL ${d}`}
      />
      <Axis
        id="right"
        title="Right axis"
        position={Position.Right}
        tickFormat={(d: any) => `R ${d}`}
        labelFormat={(d: any) => `RL ${d}`}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        displayValueSettings={{
          showValueLabel: true,
          valueFormatter: (d: any) => `V ${d}`,
        }}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
        tickFormat={(d: any) => `Series ${d}`}
      />
    </Chart>
  );
};
