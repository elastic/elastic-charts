import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Rotations/With Ordinal Axis',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const withOrdinalAxis = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings
        debug={boolean('Debug', true)}
        showLegend={boolean('Legend', true)}
        showLegendExtra
        legendPosition={select(
          'Legend position',
          {
            Left: Position.Left,
            Right: Position.Right,
            Top: Position.Top,
            Bottom: Position.Bottom,
          },
          Position.Right,
        )}
        rotation={select(
          'Rotation degree',
          {
            '0 deg(default)': 0,
            '90 deg': 90,
            '-90 deg': -90,
            '180 deg': 180,
          },
          0,
        )}
      />
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        title={'Bottom axis'}
        showOverlappingTicks={true}
        showOverlappingLabels={boolean('bottom show overlapping labels', false)}
      />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        showOverlappingTicks={true}
        showOverlappingLabels={boolean('left show overlapping labels', false)}
      />

      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 1 },
          { x: 'b', y: 2 },
          { x: 'c', y: 3 },
          { x: 'd', y: 4 },
        ]}
      />
    </Chart>
  );
};
withOrdinalAxis.story = {
  name: 'with ordinal axis',
};
