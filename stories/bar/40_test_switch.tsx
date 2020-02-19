import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../src';

export default {
  title: 'Bar Chart/Test Switch Ordinal Linear Axis',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const testSwitchOrdinalLinearAxis = () => {
  return (
    <Chart className={'story-chart'}>
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars'}
        xScaleType={select(
          'scaleType',
          {
            linear: ScaleType.Linear,
            ordinal: ScaleType.Ordinal,
          },
          ScaleType.Linear,
        )}
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
testSwitchOrdinalLinearAxis.story = {
  name: '[test] switch ordinal/linear x axis',
};
