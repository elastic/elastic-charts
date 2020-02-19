import { number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';
import { SeededDataGenerator } from '../../src/mocks/utils';

export default {
  title: 'Axis/With Many Tick Labels',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const wManyTickLabels = () => {
  const dg = new SeededDataGenerator();
  const data = dg.generateSimpleSeries(31);
  const customStyle = {
    tickLabelPadding: number('Tick Label Padding', 0),
  };

  return (
    <Chart className={'story-chart'}>
      <Settings debug={true} />
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        title={'Bottom axis'}
        showOverlappingTicks={true}
        style={customStyle}
      />
      <AreaSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
wManyTickLabels.story = {
  name: 'w many tick labels',
};
