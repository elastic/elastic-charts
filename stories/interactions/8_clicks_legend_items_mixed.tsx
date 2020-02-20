import { action } from '@storybook/addon-actions';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, LineSeries, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Interactions/Clicks and Hovers on Legend Items Mixed',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const clickHoversOnLegendItemsMixedChart = () => {
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

      <BarSeries
        id={getSpecId('bars')}
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
      <LineSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 3 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 10 },
        ]}
      />
    </Chart>
  );
};
clickHoversOnLegendItemsMixedChart.story = {
  name: 'click/hovers on legend items [mixed chart]',
};
