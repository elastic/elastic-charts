import { action } from '@storybook/addon-actions';
import React from 'react';
import { AreaSeries, Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Interactions/Clicks and Hovers on Legend Items Area Chart',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const clickHoversOnLegendItemsAreaChart = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings
        showLegend
        showLegendExtra
        legendPosition={Position.Right}
        onLegendItemClick={action('onLegendItemClick')}
        onLegendItemOver={action('onLegendItemOver')}
        onLegendItemOut={action('onLegendItemOut')}
      />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <AreaSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
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
clickHoversOnLegendItemsAreaChart.story = {
  name: 'click/hovers on legend items [area chart]',
};
