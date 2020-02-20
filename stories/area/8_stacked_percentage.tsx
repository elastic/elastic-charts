import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { AreaSeries, Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src';

export default {
  title: 'Area Chart/Stacked as a Percentage',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const stackedAsPercentage = () => {
  const stackedAsPercentage = boolean('stacked as percentage', true);
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        tickFormat={(d) => `${Number(d * 100).toFixed(0)} %`}
      />

      <AreaSeries
        id={getSpecId('areas')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        stackAsPercentage={stackedAsPercentage}
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
