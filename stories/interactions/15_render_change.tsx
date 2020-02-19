import { action } from '@storybook/addon-actions';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';

const onRenderChange = action('onRenderChange');

export default {
  title: 'Interactions/Render Change Action',
  parameters: {
    info: {
      text: `<pre>${'Sends an event every time the chart render state changes. This is provided to bind attributes to the chart for visulaization loading checks.'}</pre>`,
    },
  },
};

export const renderChangeAction = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} onRenderChange={onRenderChange} />
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
    </Chart>
  );
};
renderChangeAction.story = {
  name: 'Render change action',
};
