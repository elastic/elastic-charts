import { action } from '@storybook/addon-actions';
import React from 'react';
import { Axis, Chart, getAxisId, getSpecId, LineSeries, Position, ScaleType, Settings } from '../../src/';

const onElementListeners = {
  onElementClick: action('onElementClick'),
  onElementOver: action('onElementOver'),
  onElementOut: action('onElementOut'),
};

export default {
  title: 'Interactions/Line Point Clicks and Hovers',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const linePointClicksAndHovers = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} {...onElementListeners} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <LineSeries
        id={getSpecId('line')}
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
linePointClicksAndHovers.story = {
  name: 'line point clicks and hovers',
};
