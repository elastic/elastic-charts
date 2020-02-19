import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../src';

export default {
  title: 'Bar Chart/With Ordinal Axis',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const withOrdinalXAxis = () => {
  return (
    <Chart className={'story-chart'}>
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars'}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 7 },
          { x: 'c', y: 3 },
          { x: 'd', y: 6 },
        ]}
      />
    </Chart>
  );
};
withOrdinalXAxis.story = {
  name: 'with ordinal x axis',
};
