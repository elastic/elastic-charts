import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src';

export default {
  title: 'Rotations/180 Degrees Ordinal',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const rotations180DegOrdinal = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={180} />
      <Axis id={getAxisId('x top')} position={Position.Top} title={'x top axis'} />
      <Axis id={getAxisId('y right')} title={'y right axis'} position={Position.Right} />
      <Axis id={getAxisId('x bottom')} position={Position.Bottom} title={'x bottom axis'} />
      <Axis id={getAxisId('y left')} title={'y left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 1 },
          { x: 'b', y: 2 },
          { x: 'c', y: 3 },
          { x: 'd', y: 4 },
        ]}
      />
    </Chart>
  );
};
rotations180DegOrdinal.story = {
  name: '180 deg ordinal',
};
