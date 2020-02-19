import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';

export default {
  title: 'Bar Chart/1y2g',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const barChart1y2g = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} />
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars1'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g1', 'g2']}
        data={TestDatasets.BARCHART_1Y2G}
      />
    </Chart>
  );
};
barChart1y2g.story = {
  name: '1y2g',
};
