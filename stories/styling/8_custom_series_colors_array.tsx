import React from 'react';

import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';

export default {
  title: 'Stylings/Custom Series Color via Array',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const customSeriesColorsViaColorsArray = () => {
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
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1']}
        splitSeriesAccessors={['g1', 'g2']}
        customSeriesColors={['red', 'orange', 'blue', 'green', 'black', 'lightgrey']}
        data={TestDatasets.BARCHART_2Y2G}
      />
    </Chart>
  );
};
customSeriesColorsViaColorsArray.story = {
  name: 'custom series colors via colors array',
};
