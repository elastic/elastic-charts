/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, BrushAxis } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example = () => {
  const brushAxisSelect = select(
    'brush axis',
    {
      x: BrushAxis.X,
      y: BrushAxis.Y,
      both: BrushAxis.Both,
    },
    BrushAxis.Both,
  );
  return (
    <Chart>
      <Settings
        rotation={customKnobs.enum.rotation()}
        brushAxis={brushAxisSelect}
        onBrushEnd={action('brush')}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="bottom" showOverlappingTicks />
      <Axis id="left" title="left" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <Axis id="top" position={Position.Top} title="top" showOverlappingTicks />
      <Axis id="right" title="right" position={Position.Right} tickFormat={(d) => Number(d).toFixed(2)} />

      <AreaSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
