/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, StackMode } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const stackMode = boolean('stacked as percentage', true) ? StackMode.Percentage : undefined;
  return (
    <Chart>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />

      <Axis
        id="left2"
        title="Left axis"
        position={Position.Left}
        tickFormat={(d: any) => (stackMode === StackMode.Percentage ? `${Number(d * 100).toFixed(0)} %` : d)}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackMode={stackMode}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 4, g: 'b' },
          { x: 1, y: 5, g: 'b' },
          { x: 2, y: 8, g: 'b' },
          { x: 3, y: 2, g: 'b' },
          { x: 0, y: 2, g: 'a' },
          { x: 1, y: 2, g: 'a' },
          { x: 2, y: 0, g: 'a' },
          { x: 3, y: null, g: 'a' },
        ]}
      />
    </Chart>
  );
};
