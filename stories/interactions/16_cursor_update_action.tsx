import { action } from '@storybook/addon-actions';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';

const onPointerUpdate = action('onPointerUpdate');

export default {
  title: 'Interactions/Cursor Update Action',
  parameters: {
    info: {
      text: `<pre>${'Sends an event every time the cursor changes. This is provided to sync cursors between multiple charts.'}</pre>`,
    },
  },
};

export const cursorUpdateAction = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} onPointerUpdate={onPointerUpdate} />
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
cursorUpdateAction.story = {
  name: 'Cursor update action',
};
