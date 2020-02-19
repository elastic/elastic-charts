import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, getAxisId, getSpecId, Position, ScaleType } from '../../src/';

export default {
  title: 'Axis/Axis 4 Axes',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const axis4axes = () => {
  return (
    <Chart className={'story-chart'}>
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        title={'bottom'}
        showOverlappingTicks={true}
        hide={boolean('hide botttom axis', false)}
      />
      <Axis
        id={getAxisId('left')}
        title={'left'}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        hide={boolean('hide left axis', false)}
      />
      <Axis
        id={getAxisId('top')}
        position={Position.Top}
        title={'top'}
        showOverlappingTicks={true}
        hide={boolean('hide top axis', false)}
      />
      <Axis
        id={getAxisId('right')}
        title={'right'}
        position={Position.Right}
        tickFormat={(d) => Number(d).toFixed(2)}
        hide={boolean('hide right axis', false)}
      />

      <AreaSeries
        id={getSpecId('lines')}
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
axis4axes.story = {
  name: '4 axes',
};
