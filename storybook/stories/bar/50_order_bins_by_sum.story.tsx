/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, BinAgg, Direction } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

const data = [
  { x1: 'b', x2: 2, g1: 'false', g2: 'Canada', y1: 19, y2: 22 },
  { x1: 'd', x2: 4, g1: 'false', g2: 'USA', y1: 34, y2: 21 },
  { x1: 'd', x2: 4, g1: 'true', g2: 'USA', y1: 49, y2: 169 },
  { x1: 'e', x2: 5, g1: 'false', g2: 'Canada', y1: 40, y2: 77 },
  { x1: 'b', x2: 2, g1: 'true', g2: 'USA', y1: 28, y2: 84 },
  { x1: 'a', x2: 1, g1: 'false', g2: 'USA', y1: 53, y2: 39 },
  { x1: 'a', x2: 1, g1: 'true', g2: 'Canada', y1: 93, y2: 42 },
  { x1: 'c', x2: 3, g1: 'true', g2: 'USA', y1: 55, y2: 72 },
  { x1: 'e', x2: 5, g1: 'true', g2: 'Canada', y1: 96, y2: 74 },
  { x1: 'c', x2: 3, g1: 'false', g2: 'Canada', y1: 87, y2: 39 },
];

export const Example = () => {
  const orderOrdinalBinsBy = boolean('enable orderOrdinalBinsBy', true);
  const dataType = select(
    'Data type',
    {
      linear: 'linear',
      ordinal: 'ordinal',
    },
    'ordinal',
  );
  const direction =
    select<Direction | undefined>(
      'Direction',
      {
        Ascending: Direction.Ascending,
        Descending: Direction.Descending,
        'Default (Descending)': undefined,
      },
      Direction.Descending,
    ) || undefined;
  const binAgg =
    select<BinAgg | undefined>(
      'BinAgg',
      {
        Sum: BinAgg.Sum,
        None: BinAgg.None,
        'Default (sum)': undefined,
      },
      BinAgg.Sum,
    ) || undefined;
  return (
    <Chart>
      <Settings
        orderOrdinalBinsBy={
          orderOrdinalBinsBy
            ? {
                direction,
                binAgg,
              }
            : undefined
        }
        showLegend
        legendExtra="lastBucket"
        baseTheme={useBaseTheme()}
        legendPosition={Position.Right}
      />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks />
      <Axis id="left2" position={Position.Left} tickFormat={(d: any) => `$${Number(d).toFixed(2)}`} />

      <BarSeries
        id="bars1"
        xScaleType={dataType === 'linear' ? ScaleType.Linear : ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor={dataType === 'linear' ? 'x2' : 'x1'}
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g1', 'g2']}
        stackAccessors={['g1', 'g2']}
        data={data}
      />
    </Chart>
  );
};
