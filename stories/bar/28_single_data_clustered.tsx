import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../src';

export default {
  title: 'Bar Chart/Single Data Clustered Chart',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const singleDataClusteredChart = () => {
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
        data={[
          { x: 1, y: 10, g: 'a' },
          { x: 1, y: 5, g: 'b' },
          { x: 1, y: 3, g: 'c' },
          { x: 1, y: 10, g: 'd' },
        ]}
      />
    </Chart>
  );
};
singleDataClusteredChart.story = {
  name: 'single data clusterd chart',
};
