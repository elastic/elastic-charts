import React from 'react';
import { Axis, Chart, Position, ScaleType, Settings, BarSeries } from '../src';

export class Playground extends React.Component {
  render() {
    return (
      <div className="chart">
        <Chart>
          <Settings rotation={90} />
          <Axis id="y" title={'y'} position={Position.Left} tickFormat={(value) => `y ${Number(value)}`} />
          <Axis id="x" title={'x'} position={Position.Bottom} tickFormat={(value) => `x ${Number(value)}`} />
          <BarSeries
            id="bars"
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor={1}
            yAccessors={[0]}
            data={[[0, 10], [1, 22], [2, 33]]}
          />
        </Chart>
      </div>
    );
  }
}
