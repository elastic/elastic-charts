import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';

export default {
  title: 'Bar Chart/Stacked as Percentage',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const stackedAsPercentage = () => {
  const stackedAsPercentage = boolean('stacked as percentage', true);
  const clusterBars = boolean('cluster', true);
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} />
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={'left2'}
        title={'Left axis'}
        position={Position.Left}
        tickFormat={(d: any) => (stackedAsPercentage && !clusterBars ? `${Number(d * 100).toFixed(0)} %` : d)}
      />

      <BarSeries
        id={'bars'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={clusterBars ? [] : ['x']}
        stackAsPercentage={clusterBars ? false : stackedAsPercentage}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 2, g: 'a' },
          { x: 1, y: 7, g: 'a' },
          { x: 2, y: 3, g: 'a' },
          { x: 3, y: 6, g: 'a' },
          { x: 0, y: 4, g: 'b' },
          { x: 1, y: 5, g: 'b' },
          { x: 2, y: 8, g: 'b' },
          { x: 3, y: 2, g: 'b' },
        ]}
      />
    </Chart>
  );
};
stackedAsPercentage.story = {
  name: 'stacked as percentage',
};
