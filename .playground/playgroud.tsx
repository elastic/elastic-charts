import React from 'react';

import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  LineSeries,
  niceTimeFormatter,
  Position,
  ScaleType,
  Settings,
} from '../src';

export class Playground extends React.Component {
  render() {
    const data = [[1555819200000, 10], [1555862400000, 20], [1555905600000, 15]];
    return (
      <Chart size={[800, 300]} renderer="canvas">
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          tickFormat={niceTimeFormatter([1553861780116, 1556021780116])}
        />
        <Axis id={getAxisId('left')} title={'left'} position={Position.Left} />
        <LineSeries
          id={getSpecId('line1')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          data={data}
          xAccessor={0}
          yAccessors={[1]}
          timeZone="America/New_York"
        />
      </Chart>
    );
  }
}
