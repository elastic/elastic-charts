/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import { isVerticalRotation } from '@elastic/charts/src/chart_types/xy_chart/state/utils/common';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example = () => {
  const rotation = customKnobs.enum.rotation();
  const isVertical = isVerticalRotation(rotation);

  return (
    <Chart>
      <Settings onBrushEnd={action('onBrushEnd')} rotation={rotation} baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="bottom"
        showOverlappingTicks
        tickFormat={isVertical ? (d) => Number(d).toFixed(2) : undefined}
      />
      <Axis
        id="left"
        title="left"
        position={Position.Left}
        tickFormat={!isVertical ? (d) => Number(d).toFixed(2) : undefined}
      />
      <Axis
        id="top"
        position={Position.Top}
        title="top"
        showOverlappingTicks
        tickFormat={isVertical ? (d) => Number(d).toFixed(2) : undefined}
      />
      <Axis
        id="right"
        title="right"
        position={Position.Right}
        tickFormat={!isVertical ? (d) => Number(d).toFixed(2) : undefined}
      />

      <BarSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 1, y: 2 },
          { x: 2, y: 7 },
          { x: 3, y: 3 },
        ]}
      />
    </Chart>
  );
};
