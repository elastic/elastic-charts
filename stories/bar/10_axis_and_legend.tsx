import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';

export default {
  title: 'Bar Chart/With Axis and Legend',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const withAxisAndLegend = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} />
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars'}
        name={'Simple bar series'}
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
withAxisAndLegend.story = {
  name: 'with axis and legend',
};
