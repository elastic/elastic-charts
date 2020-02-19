import { action } from '@storybook/addon-actions';
import React from 'react';
import { Axis, Chart, getAxisId, getSpecId, LineSeries, Position, ScaleType, Settings } from '../../src/';

import { getChartRotationKnob } from '../common';

export default {
  title: 'Interactions/Brush Disabled on Ordinal xAxis',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const brushDisabledOnOrdinalXAxis = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings onBrushEnd={action('onBrushEnd')} rotation={getChartRotationKnob()} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'bottom'} showOverlappingTicks={true} />
      <Axis id={getAxisId('left')} title={'left'} position={Position.Left} />
      <LineSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 7 },
          { x: 'c', y: 3 },
          { x: 'd', y: 6 },
        ]}
      />
    </Chart>
  );
};
brushDisabledOnOrdinalXAxis.story = {
  name: 'brush disabled on ordinal x axis',
};
