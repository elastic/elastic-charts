/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, RecursivePartial, AxisStyle } from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';


export const Example = () => {
  const dg = new SeededDataGenerator();
  const data = dg.generateSimpleSeries(31);

  const customStyle: RecursivePartial<AxisStyle> = {
    tickLabel: {
      padding: number('Tick Label Padding', 0),
    },
  };

  return (
    <Chart>
      <Settings debug />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks style={customStyle} />
      <AreaSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
