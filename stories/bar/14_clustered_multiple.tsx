import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';

export default {
  title: 'Bar Chart/Clustered Multiple Series Specs',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const clusteredMultipleSeriesSpecs = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id={'bottom'} position={Position.Bottom} title={'elements'} showOverlappingTicks={true} />
      <Axis id={'left2'} title={'count'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bar series 1'}
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
      <BarSeries
        id={'bar series 2'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ]}
      />
      <BarSeries
        id={'bar series 3'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 1, g: 'a' },
          { x: 1, y: 2, g: 'a' },
          { x: 2, y: 3, g: 'a' },
          { x: 3, y: 4, g: 'a' },
          { x: 0, y: 5, g: 'b' },
          { x: 1, y: 8, g: 'b' },
          { x: 2, y: 9, g: 'b' },
          { x: 3, y: 2, g: 'b' },
        ]}
      />
    </Chart>
  );
};
clusteredMultipleSeriesSpecs.story = {
  name: 'clustered multiple series specs',
};
