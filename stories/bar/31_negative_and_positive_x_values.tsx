import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../src';

export default {
  title: 'Bar Chart/Negative and Positive X Values',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const negativeAndPositiveXValues = () => {
  return (
    <Chart className={'story-chart'}>
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        stackAccessors={['x']}
        data={[
          { x: -3, y: 1 },
          { x: 0, y: 4 },
          { x: -2, y: 2 },
          { x: 1, y: 3 },
          { x: 2, y: 2 },
          { x: -1, y: 3 },
          { x: 3, y: 1 },
        ]}
      />
    </Chart>
  );
};
negativeAndPositiveXValues.story = {
  name: 'negative and positive x values',
};
