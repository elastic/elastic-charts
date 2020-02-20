import React from 'react';

import { Axis, BarSeries, Chart, getAxisId, getSpecId, LineSeries, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Mixed Charts',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const testBarLinesLinear = () => {
  const data1 = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 5],
    [6, 4],
    [7, 3],
    [8, 2],
    [9, 1],
  ];
  const data2 = [
    [1, 5],
    [2, 4],
    [3, 3],
    [4, 2],
    [5, 1],
    [6, 2],
    [7, 3],
    [8, 4],
    [9, 5],
  ];

  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <BarSeries
        id={getSpecId('data1')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data1}
      />
      <LineSeries
        id={getSpecId('data2')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data2}
      />
    </Chart>
  );
};
testBarLinesLinear.story = {
  name: '[test] - bar/lines linear',
};
