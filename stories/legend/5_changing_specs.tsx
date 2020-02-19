import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';

export default {
  title: 'Legend/Changing Specs',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const changingSpecs = () => {
  const splitSeries = boolean('split series', true) ? ['g1', 'g2'] : undefined;
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Top} />
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
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={splitSeries}
        data={TestDatasets.BARCHART_2Y2G}
      />
    </Chart>
  );
};
changingSpecs.story = {
  name: 'changing specs',
};
