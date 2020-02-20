import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Rotations/Negative 90 Deg Linear',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const negative90DegLinear = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={-90} />
      <Axis id={getAxisId('y top')} position={Position.Top} title={'y top axis'} />
      <Axis id={getAxisId('x right')} title={'x right axis'} position={Position.Right} />
      <Axis id={getAxisId('y bottom')} position={Position.Bottom} title={'y bottom axis'} />
      <Axis id={getAxisId('x left')} title={'x left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ]}
      />
    </Chart>
  );
};
negative90DegLinear.story = {
  name: 'negative 90 deg linear',
};
