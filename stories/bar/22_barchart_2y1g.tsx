import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';

export default {
  title: 'Bar Chart/2y1g',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const barChart2y1g = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} />
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars1'}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g']}
        data={TestDatasets.BARCHART_2Y1G}
      />
    </Chart>
  );
};
barChart2y1g.story = {
  name: '2y1g',
};
