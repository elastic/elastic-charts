import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, LineSeries, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Legend/Hide Legend Items By Series',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const hideLegendItemsBySeries = () => {
  const hideBarSeriesInLegend = boolean('hide bar series in legend', false);
  const hideLineSeriesInLegend = boolean('hide line series in legend', false);

  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} />
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
        hideInLegend={hideBarSeriesInLegend}
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
        hideInLegend={hideLineSeriesInLegend}
      />
    </Chart>
  );
};
hideLegendItemsBySeries.story = {
  name: 'hide legend items by series',
};
