import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Rotations/Negative 90 Degree Ordinal',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const negative90DegreeOrdinal = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={-90} />
      <Axis id={getAxisId('y top')} position={Position.Top} title={'y top axis'} />
      <Axis id={getAxisId('x right')} title={'x right axis'} position={Position.Right} />
      <Axis id={getAxisId('y bottom')} position={Position.Bottom} title={'y bottom axis'} />
      <Axis id={getAxisId('x left')} title={'x left axis'} position={Position.Left} />
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
negative90DegreeOrdinal.story = {
  name: 'negative 90 deg ordinal',
};
