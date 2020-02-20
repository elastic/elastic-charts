import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';

export default {
  title: 'Bar Chart/With Log Y Axis',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const withLogYAxis = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Log}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 1, y: 0 },
          { x: 2, y: 1 },
          { x: 3, y: 2 },
          { x: 4, y: 3 },
          { x: 5, y: 4 },
          { x: 6, y: 5 },
          { x: 7, y: 6 },
          { x: 8, y: 7 },
        ]}
        yScaleToDataExtent={true}
      />
    </Chart>
  );
};
withLogYAxis.story = {
  name: 'with log y axis',
};
