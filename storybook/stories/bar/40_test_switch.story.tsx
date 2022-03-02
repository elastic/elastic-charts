/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

// for testing purposes only
export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <BarSeries
      id="bars"
      xScaleType={select(
        'scaleType',
        {
          linear: ScaleType.Linear,
          ordinal: ScaleType.Ordinal,
        },
        ScaleType.Linear,
      )}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        // the data is not sorted to verify that the ordinal scale keeps the sorting and the labels are
        // correctly aligned see https://github.com/elastic/elastic-charts/issues/1608
        { x: 3, y: 6 },
        { x: 1, y: 7 },
        { x: 2, y: 3 },
        { x: 0, y: 2 },
      ]}
    />
  </Chart>
);
